import { Routes } from '@angular/router';
import { ProceedingsListComponent } from './components/proceedings-list/proceedings-list.component';
import { ProceedingVotingsComponent } from './components/proceeding-votings/proceeding-votings.component';
import { VotingDetailsComponent } from './components/voting-details/voting-details.component';
import { Home } from './components/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'proceeding', component: ProceedingsListComponent },
  { path: 'proceeding/:proceedingNumber', component: ProceedingVotingsComponent },
  { path: 'voting/:proceedingNumber/:votingNumber', component: VotingDetailsComponent },
  { path: '**', redirectTo: '' },
];
