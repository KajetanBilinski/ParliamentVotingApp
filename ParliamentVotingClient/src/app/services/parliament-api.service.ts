import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proceeding, Voting, VotingDetails } from '../models/proceeding.model';

@Injectable({
  providedIn: 'root',
})
export class ParliamentApiService {
  private apiUrl = 'https://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getAllProceedings(): Observable<Proceeding[]> {
    return this.http.get<Proceeding[]>(`${this.apiUrl}/proceedings`);
  }

  getVotingsForProceeding(proceedingNumber: number): Observable<Voting[]> {
    return this.http.get<Voting[]>(`${this.apiUrl}/votings/${proceedingNumber}`);
  }

  getVotingDetails(proceedingNumber: number, votingNumber: number): Observable<VotingDetails> {
    return this.http.get<VotingDetails>(
      `${this.apiUrl}/details/${proceedingNumber}/${votingNumber}`
    );
  }
  getVotingDetailsByText(text: string): Observable<VotingDetails[]> {
    return this.http.get<VotingDetails[]>(`${this.apiUrl}/details/`, { params: { text } });
  }
}
