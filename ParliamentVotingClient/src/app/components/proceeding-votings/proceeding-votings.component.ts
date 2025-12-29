import { Component, signal, inject, effect, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParliamentApiService } from '../../services/parliament-api.service';
import { Voting } from '../../models/proceeding.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-proceeding-votings',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    MessageModule,
    PaginatorModule,
  ],
  templateUrl: './proceeding-votings.component.html',
  styleUrl: './proceeding-votings.component.scss',
})
export class ProceedingVotingsComponent {
  private apiService = inject(ParliamentApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  proceedingNumber = signal<number>(0);
  votings = signal<Voting[]>([]);
  loading = signal(false);
  error = signal('');

  // Pagination
  currentPage = signal(0);
  itemsPerPage = signal(10);

  paginatedVotings = computed(() => {
    const all = this.votings();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const start = page * perPage;
    return all.slice(start, start + perPage);
  });

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

  toTitleCase(text?: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page);
    this.itemsPerPage.set(event.rows);
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
