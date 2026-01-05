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
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ParliamentApiService } from '../../services/parliament-api.service';
import { Proceeding, VotingDetails } from '../../models/proceeding.model';
import { PrimeNG } from 'primeng/config';
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
    DialogModule,
    TableModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private router = inject(Router);
  private apiService = inject(ParliamentApiService);
  public _config: PrimeNG = inject(PrimeNG);
  proceedings = signal<Proceeding[]>([]);
  foundVotings = signal<VotingDetails[]>([]);
  searchText = signal<string>('');
  loading = signal(false);
  showSearchDialog = signal(false);
  searchLoading = signal(false);
  plLocale = { closeText: 'Zamknij', prevText: 'Poprzedni', nextText: 'Następny', monthNames: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'], monthNamesShort: ['Sty','Lut','Mar','Kwi','Maj','Cze', 'Lip','Sie','Wrz','Paź','Lis','Gru'], dayNames: ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'], dayNamesShort: ['Nie','Pon','Wt','Śr','Czw','Pt','So'], dayNamesMin: ['N','P','W','Ś','Cz','P','S'], weekHeader: 'Tydzień', firstDay: 1, isRTL: false, showMonthAfterYear: false, yearSuffix: 'r', timeOnlyTitle: 'Tylko czas', timeText: 'Czas', hourText: 'Godzina', minuteText: 'Minuta', secondText: 'Sekunda', currentText: 'Teraz', ampm: false, month: 'Miesiąc', week: 'Tydzień', day: 'Dzień', allDayText : 'Cały dzień' };
 
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
  searchVotings() {
    if (this.searchText().trim().length === 0) {
      return;
    }
    this.searchLoading.set(true);
    this.apiService.getVotingDetailsByText(this.searchText().trim()).subscribe({
      next: (data) => {
        this.foundVotings.set(data);
        this.showSearchDialog.set(true);
        this.searchLoading.set(false);
      },
      error: (err) => {
        console.error('Error searching votings:', err);
        this.searchLoading.set(false);
      },
    });
  }

  closeSearchDialog() {
    this.showSearchDialog.set(false);
  }

  viewVotingDetails(voting: VotingDetails) {
    if (voting.votingNumber && voting.proceedingNumber) {
      this.router.navigate(['/proceeding', voting.proceedingNumber, 'voting', voting.votingNumber]);
      this.closeSearchDialog();
    }
  }
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
    this._config.setTranslation(this.plLocale);
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  goToProceedings(): void {
    this.router.navigate(['/proceeding']);
  }
}
