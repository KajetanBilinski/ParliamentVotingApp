export interface Proceeding {
  proceedingNumber: number;
  title: string;
  dates: string;
  formattedDates?: string[];
}

export interface Voting {
  date: string;
  title: string;
  description: string;
  topic: string;
  votingNumber: number;
  proceedingNumber: number;
  adopted: boolean;
  showAdopted: boolean;
}

export interface VotingOptions {
  optionIndex: number;
  optionName: string;
  votesCount: number;
}

export interface VotingDetails {
  proceedingNumber: number;
  votingNumber: number;
  title: string;
  description: string;
  topic: string;
  printInfo: string;
  date: string;
  adopted: boolean;
  clubVotes?: { [clubName: string]: ClubVoteCount };
  clubListVotes?: { [clubName: string]: { [optionName: string]: ClubVoteCount } };
  votes: VoteResponse[];
  votingOptions?: VotingOptions[];
  adoptedList?: { [optionName: string]: boolean };
  totalVoted: number;
}

export interface ClubVoteCount {
  YES?: number;
  NO?: number;
  ABSENT?: number;
  ABSTAIN?: number;
  NO_VOTE?: number;
  VOTE_VALID?: number;
  VOTE_INVALID?: number;
  PRESENT?: number;
}

export interface VoteResponse {
  firstName: string;
  lastName: string;
  club: string;
  vote: string;
  listVotes?: { [optionName: string]: string };
}
