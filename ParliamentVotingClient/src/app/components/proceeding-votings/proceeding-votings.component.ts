import { Component, signal, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParliamentApiService } from '../../services/parliament-api.service';
import { Voting } from '../../models/proceeding.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-proceeding-votings',
  standalone: true,
  imports: [CardModule, ButtonModule, TagModule, ProgressSpinnerModule, MessageModule],
  template: `
    <div class="votings-container">
      <p-button
        label="Powrót do listy posiedzeń"
        icon="pi pi-arrow-left"
        (onClick)="goBack()"
        severity="secondary"
      ></p-button>

      <h1>Głosowania - Posiedzenie nr {{ proceedingNumber() }}</h1>

      <div class="votings-list">
        @for (voting of votings(); track voting.votingNumber) {
        <p-card styleClass="voting-card" (click)="openVotingDetails(voting)">
          <ng-template pTemplate="header">
            <div class="voting-header">
              <span class="voting-number">Głosowanie nr {{ voting.votingNumber }}</span>
              <p-tag
                [value]="voting.adopted ? 'Przyjęte' : 'Odrzucone'"
                [severity]="voting.adopted ? 'success' : 'danger'"
              ></p-tag>
            </div>
          </ng-template>
          <div class="voting-date">{{ formatDate(voting.date) }}</div>
          <h3>{{ voting.title }}</h3>
          <p class="description">{{ voting.description }}</p>
          @if (voting.topic) {
          <p class="topic"><strong>Temat:</strong> {{ voting.topic }}</p>
          }
        </p-card>
        }
      </div>

      @if (loading()) {
      <div class="loading">
        <p-progressSpinner ariaLabel="Ładowanie"></p-progressSpinner>
        <p>Ładowanie głosowań...</p>
      </div>
      } @if (error()) {
      <p-message severity="error" [text]="error()"></p-message>
      }
    </div>
  `,
  styles: [
    `
      .votings-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        text-align: center;
        color: #333;
        margin: 1.5rem 0 2rem 0;
      }

      .votings-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      ::ng-deep .voting-card {
        cursor: pointer;
        transition: all 0.3s ease;
      }

      ::ng-deep .voting-card:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      ::ng-deep .voting-card .p-card-header {
        padding: 1rem 1.5rem;
        background: #f8f9fa;
      }

      .voting-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .voting-number {
        font-weight: bold;
        color: #666;
        font-size: 0.9rem;
      }

      .voting-date {
        color: #888;
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
      }

      ::ng-deep .voting-card h3 {
        color: #333;
        margin: 0.5rem 0;
        font-size: 1.1rem;
      }

      .description {
        color: #666;
        margin: 0.5rem 0;
        line-height: 1.5;
      }

      .topic {
        color: #555;
        margin: 0.5rem 0 0 0;
        font-size: 0.95rem;
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
export class ProceedingVotingsComponent {
  private apiService = inject(ParliamentApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  proceedingNumber = signal<number>(0);
  votings = signal<Voting[]>([]);
  loading = signal(false);
  error = signal('');

  constructor() {
    this.route.params.subscribe((params) => {
      const num = +params['proceedingNumber'];
      if (num > 0) {
        this.proceedingNumber.set(num);
        this.loadVotings(num);
      }
    });
  }

  loadVotings(proceedingNumber: number): void {
    this.loading.set(true);
    this.apiService.getVotingsForProceeding(proceedingNumber).subscribe({
      next: (data) => {
        this.votings.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Błąd podczas ładowania głosowań');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  openVotingDetails(voting: Voting): void {
    this.router.navigate(['/voting', this.proceedingNumber(), voting.votingNumber]);
  }

  goBack(): void {
    this.router.navigate(['/']);
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
}
