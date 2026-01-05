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
  allProceedingNumbers = signal<number[]>([]);

  searchText = signal<string>('');
  searchVotingNumber = signal<string>('');
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

    const votingNum = this.searchVotingNumber().trim();
    if (votingNum) {
      filtered = filtered.filter((v) => v.votingNumber.toString() === votingNum);
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
    this.loadAllProceedingNumbers();

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

  goBack(): void {
    this.router.navigate(['/proceeding']);
  }

  loadAllProceedingNumbers(): void {
    this.apiService.getAllProceedings().subscribe({
      next: (proceedings) => {
        const numbers = proceedings.map((p) => p.proceedingNumber).sort((a, b) => a - b);
        this.allProceedingNumbers.set(numbers);
      },
      error: (err) => {
        console.error('Błąd podczas ładowania listy posiedzeń:', err);
      },
    });
  }

  hasProceeding(direction: 'previous' | 'next'): boolean {
    const allNumbers = this.allProceedingNumbers();
    const current = this.proceedingNumber();
    const currentIndex = allNumbers.indexOf(current);
    if (direction === 'next') {
      return currentIndex >= 0 && currentIndex < allNumbers.length - 1;
    }
    return currentIndex > 0;
  }

  goToProceeding(direction: 'previous' | 'next'): void {
    const allNumbers = this.allProceedingNumbers();
    const current = this.proceedingNumber();
    const currentIndex = allNumbers.indexOf(current);

    if (direction === 'previous' && currentIndex > 0) {
      const previousNumber = allNumbers[currentIndex - 1];
      this.router.navigate(['/proceeding', previousNumber]);
    } else if (direction === 'next' && currentIndex >= 0 && currentIndex < allNumbers.length - 1) {
      const nextNumber = allNumbers[currentIndex + 1];
      this.router.navigate(['/proceeding', nextNumber]);
    }
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
    return (
      date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) +
      ' • ' +
      date.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }
}
