import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { ParliamentApiService } from '../../services/parliament-api.service';
import { Proceeding } from '../../models/proceeding.model';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    CardModule,
    DatePickerModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private router = inject(Router);
  private apiService = inject(ParliamentApiService);

  proceedings = signal<Proceeding[]>([]);
  loading = signal(false);

  // Daty posiedzeń dla kalendarza
  proceedingDates = computed(() => {
    const dates: Date[] = [];
    this.proceedings().forEach((proceeding) => {
      if (proceeding.formattedDates && proceeding.formattedDates.length > 0) {
        proceeding.formattedDates.forEach((dateStr) => {
          try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              dates.push(date);
            }
          } catch (e) {
            console.error('Invalid date:', dateStr);
          }
        });
      }
    });
    return dates;
  });

  // Sprawdza czy data ma posiedzenie
  hasProceeding(date: any): boolean {
    // date z PrimeNG ma format: { day: number, month: number, year: number }
    if (!date || !date.year || date.month === undefined || !date.day) {
      return false;
    }

    const checkDate = new Date(date.year, date.month, date.day);
    checkDate.setHours(0, 0, 0, 0);

    return this.proceedingDates().some((procDate) => {
      const pd = new Date(procDate);
      pd.setHours(0, 0, 0, 0);
      return pd.getTime() === checkDate.getTime();
    });
  }

  // Sprawdza czy poprzedni dzień ma posiedzenie
  hasPreviousDay(date: any): boolean {
    if (!date || !date.year || date.month === undefined || !date.day) {
      return false;
    }
    const prevDate = new Date(date.year, date.month, date.day - 1);
    return this.hasProceeding({
      day: prevDate.getDate(),
      month: prevDate.getMonth(),
      year: prevDate.getFullYear(),
    });
  }

  // Sprawdza czy następny dzień ma posiedzenie
  hasNextDay(date: any): boolean {
    if (!date || !date.year || date.month === undefined || !date.day) {
      return false;
    }
    const nextDate = new Date(date.year, date.month, date.day + 1);
    return this.hasProceeding({
      day: nextDate.getDate(),
      month: nextDate.getMonth(),
      year: nextDate.getFullYear(),
    });
  }

  constructor() {
    this.loadProceedings();
  }

  loadProceedings(): void {
    this.loading.set(true);
    this.apiService.getAllProceedings().subscribe({
      next: (data) => {
        this.proceedings.set(data);
        this.proceedings().forEach((p) => {
          p.formattedDates = String(p.dates || '')
            .split(/\s+/)
            .filter(Boolean);
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading proceedings:', err);
        this.loading.set(false);
      },
    });
  }

  onDateSelect(event: any): void {
    const selectedDate = event as Date;
    if (!selectedDate) return;

    // Normalizacja daty (bez czasu)
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    // Znajdź posiedzenie dla wybranej daty
    const proceeding = this.proceedings().find((p) => {
      if (!p.formattedDates) return false;
      return p.formattedDates.some((dateStr) => {
        try {
          const proceedingDate = new Date(dateStr);
          proceedingDate.setHours(0, 0, 0, 0);
          return proceedingDate.getTime() === selected.getTime();
        } catch (e) {
          return false;
        }
      });
    });

    if (proceeding) {
      this.router.navigate(['/proceeding', proceeding.proceedingNumber]);
    }
  }

  goToProceedings(): void {
    this.router.navigate(['/proceedings']);
  }
}
