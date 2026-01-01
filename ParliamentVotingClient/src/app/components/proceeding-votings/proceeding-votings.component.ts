import { Component, signal, inject, effect, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParliamentApiService } from '../../services/parliament-api.service';
import { Voting } from '../../models/proceeding.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-proceeding-votings',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    MessageModule,
    PaginatorModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
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

  searchText = signal<string>('');
  selectedStatus = signal<string | null>(null);

  statusOptions = [
    { label: 'Wszystkie', value: null },
    { label: 'Przyjęte', value: 'true' },
    { label: 'Odrzucone', value: 'false' },
    { label: 'Wielokrotne', value: 'multiple' },
  ];

  filteredVotings = computed(() => {
    let filtered = this.votings();

    const status = this.selectedStatus();
    if (status !== null) {
      if (status === 'multiple') {
        filtered = filtered.filter((v) => v.showAdopted === false);
      } else if (status === 'true') {
        filtered = filtered.filter((v) => v.adopted === true);
      } else if (status === 'false') {
        filtered = filtered.filter((v) => v.adopted === false);
      }
    }

    const search = this.searchText().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.title?.toLowerCase().includes(search) ||
          v.description?.toLowerCase().includes(search) ||
          v.topic?.toLowerCase().includes(search)
      );
    }

    return filtered;
  });

  currentPage = signal(0);
  itemsPerPage = signal(10);

  paginatedVotings = computed(() => {
    const all = this.filteredVotings();
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

  capitalize(text?: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
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

  onFilterChange(): void {
    this.currentPage.set(0);
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
