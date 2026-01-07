# ParliamentVotingApp

A web application for browsing and analyzing votings of the Polish Parliament (Sejm API `api.sejm.gov.pl`). The system consists of an ASP.NET Core backend and an Angular frontend application using the PrimeNG library.

## Architecture

The system consists of three main components:

```
┌─────────────────────┐
│  Angular Frontend   │
└──────────┬──────────┘
           │ HTTP
           ↓
┌─────────────────────┐
│  ASP.NET Core API   │
└──────────┬──────────┘
           │ EF Core
           ↓
┌─────────────────────┐
│  MariaDB            │
└─────────────────────┘
           ↑
           │ HTTP
┌─────────────────────┐
│  Sejm API           │
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

#### REST API
`ParliamentVotingsController` provides the following endpoints:

- `GET /api/home` - Home page with statistics and search options
- `GET /api/proceedings` - List of all proceedings
- `GET /api/votings/{proceedingNumber}` - Votings for a specific proceeding
- `GET /api/voting/{proceedingNumber}/{votingNumber}` - Details of a single voting 

### Data Model

The system uses MariaDB with the following tables:

#### **Proceedings**
#### **VotingDetails**
#### **VoteResponses**
#### **ClubVotes**
#### **VotingOptions**

## Installation and Setup

### Requirements
- **.NET 10.0 SDK**
- **MariaDB 12.1.0**
- **Angular CLI 21.0.4**

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
