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
  template: `
    <div class="proceedings-container">
      <h1>Lista Posiedzeń Sejmu</h1>

      <div class="proceedings-list">
        @for (proceeding of proceedings(); track proceeding.proceedingNumber) {
        <p-card
          [header]="'Posiedzenie nr ' + proceeding.proceedingNumber"
          styleClass="proceeding-card"
          (dblclick)="openProceeding(proceeding.proceedingNumber)"
        >
          <p>{{ proceeding.title }}</p>
        </p-card>
        }
      </div>

      @if (loading()) {
      <div class="loading">
        <p-progressSpinner ariaLabel="Ładowanie"></p-progressSpinner>
        <p>Ładowanie...</p>
      </div>
      } @if (error()) {
      <p-message severity="error" [text]="error()"></p-message>
      }
    </div>
  `,
  styles: [
    `
      .proceedings-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 2rem;
      }

      .proceedings-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      ::ng-deep .proceeding-card {
        cursor: pointer;
        transition: all 0.3s ease;
      }

      ::ng-deep .proceeding-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      ::ng-deep .proceeding-card .p-card-header {
        color: #4caf50;
        font-size: 1.2rem;
        font-weight: 600;
      }

      ::ng-deep .proceeding-card .p-card-body p {
        color: #666;
        margin: 0;
        line-height: 1.5;
      }

      .loading {
        text-align: center;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
    `,
  ],
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
