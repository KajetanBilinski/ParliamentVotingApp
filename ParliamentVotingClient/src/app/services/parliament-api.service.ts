import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proceeding, Voting, VotingDetails } from '../models/proceeding.model';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class ParliamentApiService {
  private apiUrl = 'https://localhost:5000/api';
  private http = inject(HttpClient);
  private cacheService = inject(CacheService);

  getAllProceedings(): Observable<Proceeding[]> {
    return this.cacheService.get(
      'proceedings_all',
      () => this.http.get<Proceeding[]>(`${this.apiUrl}/proceedings`),
      true
    );
  }

  getVotingsForProceeding(proceedingNumber: number): Observable<Voting[]> {
    return this.cacheService.get(
      `votings_${proceedingNumber}`,
      () => this.http.get<Voting[]>(`${this.apiUrl}/votings/${proceedingNumber}`),
      true
    );
  }

  getVotingDetails(proceedingNumber: number, votingNumber: number): Observable<VotingDetails> {
    return this.cacheService.get(
      `details_${proceedingNumber}_${votingNumber}`,
      () =>
        this.http.get<VotingDetails>(`${this.apiUrl}/details/${proceedingNumber}/${votingNumber}`),
      true
    );
  }

  getVotingDetailsByText(text: string): Observable<VotingDetails[]> {
    return this.cacheService.get(
      `details_search_${text}`,
      () => this.http.get<VotingDetails[]>(`${this.apiUrl}/details/`, { params: { text } }),
      false
    );
  }

  /**
   * Odświeża cache dla wszystkich posiedzeń
   */
  refreshProceedings(): Observable<Proceeding[]> {
    return this.cacheService.refresh(
      'proceedings_all',
      () => this.http.get<Proceeding[]>(`${this.apiUrl}/proceedings`),
      true
    );
  }

  /**
   * Odświeża cache dla głosowań danego posiedzenia
   */
  refreshVotings(proceedingNumber: number): Observable<Voting[]> {
    return this.cacheService.refresh(
      `votings_${proceedingNumber}`,
      () => this.http.get<Voting[]>(`${this.apiUrl}/votings/${proceedingNumber}`),
      true
    );
  }

  /**
   * Odświeża cache dla szczegółów głosowania
   */
  refreshVotingDetails(proceedingNumber: number, votingNumber: number): Observable<VotingDetails> {
    return this.cacheService.refresh(
      `details_${proceedingNumber}_${votingNumber}`,
      () =>
        this.http.get<VotingDetails>(`${this.apiUrl}/details/${proceedingNumber}/${votingNumber}`),
      true
    );
  }

  /**
   * Czyści cały cache
   */
  clearCache(): void {
    this.cacheService.clear();
  }
}
