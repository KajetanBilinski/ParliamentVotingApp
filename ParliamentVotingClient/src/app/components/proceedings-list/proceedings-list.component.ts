import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ParliamentApiService } from '../../services/parliament-api.service';
import { Proceeding } from '../../models/proceeding.model';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-proceedings-list',
  standalone: true,
  imports: [CardModule, ProgressSpinnerModule, MessageModule],
  templateUrl: './proceedings-list.component.html',
  styleUrl: './proceedings-list.component.scss',
})
export class ProceedingsListComponent {
  private apiService = inject(ParliamentApiService);
  private router = inject(Router);

  proceedings = signal<Proceeding[]>([]);
  loading = signal(false);
  error = signal('');

  constructor() {
    this.loadProceedings();
  }

  loadProceedings(): void {
    this.loading.set(true);
    this.apiService.getAllProceedings().subscribe({
      next: (data) => {
        this.proceedings.set(data);
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
}
