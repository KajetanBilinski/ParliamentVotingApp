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
  templateUrl: './voting-details.component.html',
  styleUrl: './voting-details.component.scss',
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
