import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ParliamentApiService } from '../../services/parliament-api.service';
import { Proceeding } from '../../models/proceeding.model';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { DatePickerModule } from 'primeng/datepicker';
import { ChipModule } from 'primeng/chip';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-proceedings-list',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    ProgressSpinnerModule,
    MessageModule,
    ChipModule,
    DatePickerModule,
  ],
  templateUrl: './proceedings-list.component.html',
  styleUrl: './proceedings-list.component.scss',
})
export class ProceedingsListComponent {
  private apiService = inject(ParliamentApiService);
  private router = inject(Router);

  proceedings = signal<Proceeding[]>([]);
  loading = signal(false);
  error = signal('');
  dateRange = signal<Date[]>([]);

  constructor() {
    this.loadProceedings();
  }

  filteredProceedings(): Proceeding[] {
    const range = this.dateRange();
    if (!range || range.length === 0) return this.proceedings();
    const start = new Date(range[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(range[1] ?? range[0]);
    end.setHours(23, 59, 59, 999);

    return this.proceedings().filter((p) => {
      const dates = p.formattedDates || [];
      return dates.some((ds) => {
        const d = new Date(ds);
        if (isNaN(d.getTime())) return false;
        return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
      });
    });
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
        this.error.set('Błąd podczas ładowania posiedzeń');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  openProceeding(proceedingNumber: number): void {
    this.router.navigate(['/proceeding', proceedingNumber]);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return new Intl.DateTimeFormat('pl-PL', opts).format(d);
    } catch (e) {
      return dateStr;
    }
  }
}
