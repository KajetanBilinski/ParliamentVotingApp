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
import { SelectModule } from 'primeng/select';

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
    SelectModule,
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
  selectedVoteType: string | null = null;
  selectedClubFilter = signal<{ club: string; voteType: string; optionName?: string } | null>(null);

  get voteTypeOptions(): { label: string; value: string | null }[] {
    const details = this.votingDetails();
    if (!details || !details.votes) {
      return [{ label: 'Wszystkie', value: null }];
    }

    const options: { label: string; value: string | null }[] = [
      { label: 'Wszystkie', value: null },
    ];
    const voteTypeMap: { [key: string]: { label: string; variants: string[] } } = {
      yes: { label: 'Za', variants: ['za', 'yes'] },
      no: { label: 'Przeciw', variants: ['przeciw', 'no'] },
      abstain: { label: 'Wstrzymało się', variants: ['wstrzym', 'abstain'] },
      absent: { label: 'Nieobecni', variants: ['nieobecn', 'absent', 'brak'] },
      no_vote: { label: 'Nie głosował', variants: ['nie głosował', 'nie glosował', 'no vote'] },
      vote_valid: {
        label: 'Głos ważny',
        variants: ['głos ważny', 'glos wazny', 'vote valid', 'ważny', 'wazny'],
      },
      vote_invalid: {
        label: 'Głos nieważny',
        variants: ['głos nieważny', 'glos niewazny', 'vote invalid', 'nieważny', 'niewazny'],
      },
      present: { label: 'Obecni', variants: ['obecn', 'present'] },
    };

    Object.entries(voteTypeMap).forEach(([key, config]) => {
      const hasVotes = details.votes.some((vote) =>
        config.variants.some((variant) => vote.vote.toLowerCase().includes(variant))
      );
      if (hasVotes) {
        options.push({ label: config.label, value: key });
      }
    });

    return options;
  }

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
    return details ? Object.keys(details.clubVotes!) : [];
  }

  getClubListNames(): string[] {
    const details = this.votingDetails();
    return details && details.clubListVotes ? Object.keys(details.clubListVotes) : [];
  }

  getOptionNamesForClub(clubName: string): string[] {
    const details = this.votingDetails();
    return details && details.clubListVotes && details.clubListVotes[clubName]
      ? Object.keys(details.clubListVotes[clubName])
      : [];
  }

  getAllVotingOptions(): string[] {
    const details = this.votingDetails();
    if (!details || !details.votes || details.votes.length === 0) return [];

    const firstVoteWithList = details.votes.find(
      (v) => v.listVotes && Object.keys(v.listVotes).length > 0
    );
    if (firstVoteWithList && firstVoteWithList.listVotes) {
      return Object.keys(firstVoteWithList.listVotes);
    }
    return [];
  }

  hasVoteList(): boolean {
    const details = this.votingDetails();
    return details?.votes?.some((v) => v.listVotes && Object.keys(v.listVotes).length > 0) || false;
  }

  getVoteForOption(vote: any, optionName: string): string {
    return vote.listVotes && vote.listVotes[optionName] ? vote.listVotes[optionName] : '-';
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

  getVoteStatistics(): { yes: number; no: number; abstain: number; absent: number; total: number } {
    const details = this.votingDetails();
    if (!details || !details.votes) {
      return { yes: 0, no: 0, abstain: 0, absent: 0, total: 0 };
    }

    const stats = { yes: 0, no: 0, abstain: 0, absent: 0, total: details.totalVoted };

    details.votes.forEach((vote) => {
      const voteText = vote.vote.toLowerCase();
      if (voteText.includes('za') || voteText.includes('yes')) {
        stats.yes++;
      } else if (voteText.includes('przeciw') || voteText.includes('no')) {
        stats.no++;
      } else if (voteText.includes('wstrzym') || voteText.includes('abstain')) {
        stats.abstain++;
      } else {
        stats.absent++;
      }
    });

    return stats;
  }

  getVoteStatisticsForOption(optionName: string): {
    yes: number;
    no: number;
    abstain: number;
    absent: number;
    total: number;
  } {
    const details = this.votingDetails();
    if (!details || !details.votes) {
      return { yes: 0, no: 0, abstain: 0, absent: 0, total: 0 };
    }

    const stats = { yes: 0, no: 0, abstain: 0, absent: 0, total: 0 };

    details.votes.forEach((vote) => {
      if (vote.listVotes && vote.listVotes[optionName]) {
        stats.total++;
        const voteText = vote.listVotes[optionName].toLowerCase();
        if (voteText.includes('za') || voteText.includes('yes')) {
          stats.yes++;
        } else if (voteText.includes('przeciw') || voteText.includes('no')) {
          stats.no++;
        } else if (voteText.includes('wstrzym') || voteText.includes('abstain')) {
          stats.abstain++;
        } else {
          stats.absent++;
        }
      }
    });

    return stats;
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  getBarWidth(value: number, total: number): number {
    return this.getPercentage(value, total);
  }

  shouldShowLabel(value: number, total: number): boolean {
    const percentage = this.getPercentage(value, total);
    return percentage >= 5;
  }

  filterByClubVote(club: string, voteType: string, optionName?: string) {
    const current = this.selectedClubFilter();
    if (
      current &&
      current.club === club &&
      current.voteType === voteType &&
      current.optionName === optionName
    ) {
      this.selectedClubFilter.set(null);
    } else {
      this.selectedClubFilter.set({ club, voteType, optionName });
    }
  }

  isFilterActive(club: string, voteType: string, optionName?: string): boolean {
    const current = this.selectedClubFilter();
    return (
      current !== null &&
      current.club === club &&
      current.voteType === voteType &&
      current.optionName === optionName
    );
  }

  getFilteredVotes(): any[] {
    const details = this.votingDetails();
    if (!details || !details.votes) return [];

    let votes = [...details.votes];

    const clubFilter = this.selectedClubFilter();
    if (clubFilter) {
      votes = votes.filter((vote) => {
        const clubMatch = vote.club.toLowerCase() === clubFilter.club.toLowerCase();
        const typeMap: { [key: string]: string[] } = {
          YES: ['za', 'yes'],
          NO: ['przeciw', 'no'],
          ABSTAIN: ['wstrzym', 'abstain'],
          ABSENT: ['nieobecn', 'absent', 'brak'],
        };

        const searchTerms = typeMap[clubFilter.voteType];

        if (clubFilter.optionName && vote.listVotes && vote.listVotes[clubFilter.optionName]) {
          const optionVote = vote.listVotes[clubFilter.optionName].toLowerCase();
          const voteMatch = searchTerms.some((term) => optionVote.includes(term));
          return clubMatch && voteMatch;
        } else {
          const voteMatch = searchTerms.some((term) => vote.vote.toLowerCase().includes(term));
          return clubMatch && voteMatch;
        }
      });
    }

    if (this.selectedVoteType) {
      const voteTypeMap: { [key: string]: string[] } = {
        yes: ['za', 'yes'],
        no: ['przeciw', 'no'],
        abstain: ['wstrzym', 'abstain'],
        absent: ['nieobecn', 'absent', 'brak'],
        no_vote: ['nie głosował', 'nie glosował', 'no vote'],
        vote_valid: ['głos ważny', 'glos wazny', 'vote valid', 'ważny', 'wazny'],
        vote_invalid: ['głos nieważny', 'glos niewazny', 'vote invalid', 'nieważny', 'niewazny'],
        present: ['obecn', 'present'],
      };

      const voteVariants = voteTypeMap[this.selectedVoteType] || [];

      votes = votes.filter((vote) => {
        const voteText = vote.vote.toLowerCase();
        return voteVariants.some((variant) => voteText.includes(variant));
      });
    }

    return votes;
  }
}
