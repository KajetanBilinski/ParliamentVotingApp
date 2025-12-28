import { Component, signal, inject, effect, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParliamentApiService } from '../../services/parliament-api.service';
import { VotingDetails } from '../../models/proceeding.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Table, TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-voting-details',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    PanelModule,
    ProgressSpinnerModule,
    MessageModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
  ],
  template: `
    @if (!loading() && votingDetails()) {
    <div class="details-container">
      <p-button
        label="Powrót do głosowań"
        icon="pi pi-arrow-left"
        (onClick)="goBack()"
        severity="secondary"
      ></p-button>

      <div class="header">
        <h1>{{ votingDetails()!.title }}</h1>
        <p-tag
          [value]="votingDetails()!.adopted ? 'PRZYJĘTE' : 'ODRZUCONE'"
          [severity]="votingDetails()!.adopted ? 'success' : 'danger'"
          styleClass="text-lg"
        ></p-tag>
      </div>

      <p-card styleClass="info-card">
        <div class="info-grid">
          <div class="info-item">
            <strong>Posiedzenie:</strong> {{ votingDetails()!.proceedingNumber }}
          </div>
          <div class="info-item">
            <strong>Głosowanie nr:</strong> {{ votingDetails()!.votingNumber }}
          </div>
          <div class="info-item">
            <strong>Data:</strong> {{ formatDate(votingDetails()!.date) }}
          </div>
        </div>
      </p-card>

      @if (votingDetails()!.description) {
      <p-panel header="Opis">
        <p>{{ votingDetails()!.description }}</p>
      </p-panel>
      } @if (votingDetails()!.topic) {
      <p-panel header="Temat">
        <p>{{ votingDetails()!.topic }}</p>
      </p-panel>
      } @if (votingDetails()!.clubVotes && getClubNames().length > 0) {
      <div class="club-votes-section">
        <h2>Głosy klubów</h2>
        <div class="clubs-grid">
          @for (clubName of getClubNames(); track clubName) {
          <p-card [header]="clubName">
            <div class="vote-stats">
              @if (votingDetails()!.clubVotes[clubName].YES) {
              <div class="stat yes">
                <span class="label">Za:</span>
                <span class="value">{{ votingDetails()!.clubVotes[clubName].YES }}</span>
              </div>
              } @if (votingDetails()!.clubVotes[clubName].NO) {
              <div class="stat no">
                <span class="label">Przeciw:</span>
                <span class="value">{{ votingDetails()!.clubVotes[clubName].NO }}</span>
              </div>
              } @if (votingDetails()!.clubVotes[clubName].ABSTAIN) {
              <div class="stat abstain">
                <span class="label">Wstrzymało się:</span>
                <span class="value">{{ votingDetails()!.clubVotes[clubName].ABSTAIN }}</span>
              </div>
              } @if (votingDetails()!.clubVotes[clubName].ABSENT) {
              <div class="stat not-participating">
                <span class="label">Nieobecni:</span>
                <span class="value">{{ votingDetails()!.clubVotes[clubName].ABSENT }}</span>
              </div>
              }
            </div>
          </p-card>
          }
        </div>
      </div>
      } @if (votingDetails()!.votes && votingDetails()!.votes.length > 0) {
      <div class="individual-votes-section">
        <div class="header-with-search">
          <h2>Głosy posłów ({{ votingDetails()!.votes.length }})</h2>
          <p-iconfield iconPosition="left">
            <p-inputicon styleClass="pi pi-search"></p-inputicon>
            <input
              pInputText
              type="text"
              [(ngModel)]="searchValue"
              (input)="onSearchChange($event)"
              placeholder="Szukaj posła..."
            />
          </p-iconfield>
        </div>
        <p-table
          #dt
          [value]="votingDetails()!.votes"
          [paginator]="true"
          [rows]="50"
          [rowsPerPageOptions]="[25, 50, 100]"
          [showCurrentPageReport]="true"
          [globalFilterFields]="['firstName', 'lastName', 'club']"
          currentPageReportTemplate="Pokazywanie {first} do {last} z {totalRecords} wpisów"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Imię i nazwisko</th>
              <th>Klub</th>
              <th>Głos</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-vote>
            <tr>
              <td>{{ vote.firstName }} {{ vote.lastName }}</td>
              <td>{{ vote.club }}</td>
              <td>
                <p-tag [value]="vote.vote" [severity]="getVoteSeverity(vote.vote)"></p-tag>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      }
    </div>
    } @if (loading()) {
    <div class="loading">
      <p-progressSpinner ariaLabel="Ładowanie"></p-progressSpinner>
      <p>Ładowanie szczegółów głosowania...</p>
    </div>
    } @if (error()) {
    <p-message severity="error" [text]="error()"></p-message>
    }
  `,
  styles: [
    `
      .details-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 1.5rem 0 2rem 0;
        gap: 2rem;
      }

      h1 {
        color: #333;
        margin: 0;
        flex: 1;
      }

      ::ng-deep .text-lg {
        font-size: 1.1rem;
        padding: 0.75rem 1.5rem;
      }

      ::ng-deep .info-card {
        margin-bottom: 1.5rem;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .info-item {
        color: #333;
        font-size: 1rem;
      }

      .info-item strong {
        color: #666;
      }

      ::ng-deep p-panel {
        display: block;
        margin-bottom: 1.5rem;
      }

      h2 {
        color: #333;
        margin: 2rem 0 1rem 0;
        font-size: 1.3rem;
        border-bottom: 2px solid #4caf50;
        padding-bottom: 0.5rem;
      }

      .club-votes-section {
        margin-bottom: 2rem;
      }

      .clubs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
      }

      .vote-stats {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .stat {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        border-radius: 4px;
      }

      .stat.yes {
        background: #e8f5e9;
      }

      .stat.no {
        background: #ffebee;
      }

      .stat.abstain {
        background: #fff9c4;
      }

      .stat.not-participating {
        background: #f5f5f5;
      }

      .stat .label {
        font-weight: 500;
        color: #555;
      }

      .stat .value {
        font-weight: bold;
        color: #333;
      }

      .individual-votes-section {
        margin-top: 2rem;
      }

      .header-with-search {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .header-with-search h2 {
        margin: 0;
      }

      ::ng-deep .p-iconfield {
        width: 300px;
      }

      ::ng-deep .p-iconfield input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
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
export class VotingDetailsComponent {
  private apiService = inject(ParliamentApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('dt') dt: Table | undefined;

  votingDetails = signal<VotingDetails | null>(null);
  loading = signal(false);
  error = signal('');
  searchValue = '';

  constructor() {
    effect(() => {
      this.route.params.subscribe((params) => {
        const proceedingNumber = +params['proceedingNumber'];
        const votingNumber = +params['votingNumber'];
        this.loadVotingDetails(proceedingNumber, votingNumber);
      });
    });
  }

  loadVotingDetails(proceedingNumber: number, votingNumber: number): void {
    this.loading.set(true);
    this.apiService.getVotingDetails(proceedingNumber, votingNumber).subscribe({
      next: (data) => {
        this.votingDetails.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Błąd podczas ładowania szczegółów głosowania');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  goBack(): void {
    const details = this.votingDetails();
    if (details) {
      this.router.navigate(['/proceeding', details.proceedingNumber]);
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

  getClubNames(): string[] {
    const details = this.votingDetails();
    return details ? Object.keys(details.clubVotes) : [];
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }

  getVoteSeverity(vote: string): 'success' | 'danger' | 'warn' | 'secondary' {
    if (vote.toLowerCase().includes('za') || vote.toLowerCase().includes('yes')) {
      return 'success';
    }
    if (vote.toLowerCase().includes('przeciw') || vote.toLowerCase().includes('no')) {
      return 'danger';
    }
    if (vote.toLowerCase().includes('wstrzym') || vote.toLowerCase().includes('abstain')) {
      return 'warn';
    }
    return 'secondary';
  }
}
