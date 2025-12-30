# ParliamentVotingApp

A web application for browsing and analyzing votings of the Polish Parliament (Sejm). The system consists of an ASP.NET Core backend and an Angular frontend application using the PrimeNG library.

## Table of Contents

- [Project Description](#-project-description)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Database](#-database)
- [API](#-api)
- [User Interface](#-user-interface)
- [Installation and Setup](#-installation-and-setup)

## Project Description

ParliamentVotingApp is a web application that enables browsing and analyzing parliamentary votings. The system automatically fetches data from the public Sejm API (`api.sejm.gov.pl`), stores it in a MySQL database, and provides access through its own REST API and responsive user interface.

## Architecture

The system consists of three main components:

```
┌─────────────────────┐
│  Angular Frontend   │  ← User Interface (PrimeNG)
│  (ParliamentClient) │
└──────────┬──────────┘
           │ HTTP
           ↓
┌─────────────────────┐
│  ASP.NET Core API   │  ← Backend + Background Worker
│  (.NET 10.0)        │
└──────────┬──────────┘
           │ EF Core
           ↓
┌─────────────────────┐
│  MariaDB            │  ← Data Storage
│  (v12.1.0)          │
└─────────────────────┘
           ↑
           │ HTTP
┌─────────────────────┐
│  Sejm API           │  ← External Data Source
│  api.sejm.gov.pl    │
└─────────────────────┘
```

## Technologies

### Backend
- **.NET 10.0**
- **ASP.NET Core Web API** 
- **Entity Framework Core** 
- **MariaDB 12.1.0** 

### Frontend
- **Angular 21.0.0**
- **PrimeNG 21.0.2** 
- **PrimeIcons 7.0.0** 

## Features

### Backend

#### Background Worker
- Automatic data fetching from Sejm API in the background
- Synchronization of proceedings and votings

#### REST API
`ParliamentVotingsController` provides the following endpoints:

- `GET /api/proceedings` - List of all proceedings
- `GET /api/votings/{proceedingNumber}` - Votings for a specific proceeding
- `GET /api/voting/{proceedingNumber}/{votingNumber}` - Details of a single voting

#### Data Management
- **DatabaseManager**
- **PVBackendAPI** 

### Frontend

#### Proceedings List (`ProceedingsListComponent`)
- Display of all Sejm proceedings
- Filter proceedings by date range

#### Proceeding Votings (`ProceedingVotingsComponent`)
- List of all votings from a specific proceeding
- Information about each voting:
  - Voting number
  - Title and description
  - Topic
  - Date

#### Voting Details (`VotingDetailsComponent`)
- Table with voting results of MPs/clubs
- **Advanced filtering:**
  - Text search
  - Filter by vote type
  - Filter by club and vote type

## Database

### Data Model

The system uses MariaDB with the following tables:

#### **Proceedings**
- `IdProceeding` (PK) - Identifier
- `ProceedingNumber` - Proceeding number
- `Title` - Title
- `Dates` - Proceeding dates

#### **VotingDetails**
- `IdVotingDetail` (PK) - Identifier
- `IdProceeding` (FK) - Reference to proceeding
- `VotingNumber` - Voting number
- `Date` - Voting date
- `Title` - Title
- `Topic` - Topic
- `Description` - Description
- `YesVotesCount` - Number of votes for
- `NoVotesCount` - Number of votes against
- `AbstainCount` - Number of abstentions
- `NotParticipatingCount` - Number of non-participants
- `TotalVoted` - Total voted
- `MajorityType` - Majority type
- `MajorityVotes` - Number of votes for majority
- `Adopted` - Whether adopted

#### **VoteResponses**
- `IdVoteResponse` (PK) - Identifier
- `IdVotingDetail` (FK) - Reference to voting
- MP vote data

#### **ClubVotes**
- `IdClubVote` (PK) - Identifier
- `IdVotingDetail` (FK) - Reference to voting
- `VoteType` - Vote type (enum stored as string)

#### **VotingOptions**
- `IdVotingOption` (PK) - Identifier
- `IdVotingDetail` (FK) - Reference to voting

## Installation and Setup

### Requirements
- **.NET 10.0 SDK**
- **Node.js 18+** (with npm 11.6.2+)
- **MySQL 12.1.0+**
- **Angular CLI 21.0.4+**

### Backend

1. Navigate to the backend folder:
```powershell
cd ParliamentVotingApp
```

2. Configure database connection in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "Default": "server=localhost;database=parliament;user=root;password=yourpassword"
  }
}
```

3. Run the application:
```powershell
dotnet run
```

The backend will be available by default on the port configured in `launchSettings.json`.

### Frontend

1. Navigate to the frontend folder:
```powershell
cd ParliamentVotingClient
```

2. Install dependencies:
```powershell
npm install
```

3. Run the development application:
```powershell
npm start
```

The application will be available at `http://localhost:4200`.
---

**License:** Check the [LICENSE](LICENSE) file

**Data Source:** [Polish Parliament API](https://api.sejm.gov.pl/)
