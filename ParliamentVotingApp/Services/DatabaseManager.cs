using Microsoft.EntityFrameworkCore;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Enums;
using ParliamentVotingApp.Models.DB;
using ParliamentVotingApp.Models.DTO;
using System.Runtime.CompilerServices;

namespace ParliamentVotingApp.Services;

public class DatabaseManager : IDatabaseManager
{
    private readonly ParliamentContext _context;

    public DatabaseManager(ParliamentContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<int,List<int>>> GetAllProceedingAndVotingNumbers()
    {
        var data = await _context.VotingDetails
            .Include(v => v.Proceeding) 
            .Select(v => new
            {
                ProceedingNumber = v.Proceeding.ProceedingNumber,
                v.VotingNumber
            })
            .ToListAsync();

        var result = data
            .GroupBy(x => x.ProceedingNumber)
            .ToDictionary(
                g => g.Key,
                g => g.Select(x => x.VotingNumber).ToList()
            );

        return result;
    }

    public async Task<List<Proceeding>> GetAllProceedings()
    {
        var proceedings = await _context.Proceedings.ToListAsync();
        if (proceedings == null || proceedings.Count == 0) return new List<Proceeding>();
        return proceedings;
    }

    public async Task<List<VotingDetail>> GetAllVotingsForProceeding(int proceedingNumber)
    {
        var votings = await _context.VotingDetails.Where(v => v.Proceeding.IdProceeding == proceedingNumber).ToListAsync();
        if (votings == null || votings.Count == 0) return new List<VotingDetail>();
        return votings;
    }

    public async Task<VotingDetailsResponse?> GetVotingDetails(int proceedingNumber, int votingNumber)
    {
        var voting = await _context.VotingDetails
            .Include(v => v.Proceeding)
            .Include(v => v.VotingOptions)
            .Include(v => v.ClubVotes)
            .Include(v => v.VoteResponses)
            .Where(v =>
                v.Proceeding.ProceedingNumber == proceedingNumber &&
                v.VotingNumber == votingNumber
            )
            .FirstOrDefaultAsync();

        if (voting == null)
            return null;

        var response = new VotingDetailsResponse
        {
            VotingNumber = voting.VotingNumber,
            Date = voting.Date,
            Title = voting.Title,
            Topic = voting.Topic,
            Description = voting.Description,

            YesVotesCount = voting.YesVotesCount,
            NoVotesCount = voting.NoVotesCount,
            AbstainCount = voting.AbstainCount,
            NotParticipatingCount = voting.NotParticipatingCount,
            TotalVoted = voting.TotalVoted,

            MajorityType = voting.MajorityType,
            MajorityVotes = voting.MajorityVotes,

            VotingOptions = voting.VotingOptions?
                .Select(o => new VotingOptions
                {
                    OptionIndex = o.OptionIndex,
                    OptionName = o.OptionName,
                    VotesCount = o.VotesCount
                })
                .ToList(),

            Votes = voting.VoteResponses?
                .Select(vr => new VoteResponseDTO
                {
                    Club = vr.ClubName,
                    FirstName = vr.FirstName,
                    SecondName = vr.SecondName,
                    LastName = vr.LastName,
                    VoteType = vr.VoteType
                })
                .ToList(),

            ClubVotes = voting.ClubVotes?
                .GroupBy(cv => cv.ClubName)
                .ToDictionary(
                    g => g.Key,
                    g => g.ToDictionary(
                        x => x.VoteType,
                        x => x.VoteCount
                    )
                ),
        };
        return response;
    }


    public async Task AddNewProceeding(ProceedingResponse proceedingResponse)
    {
        var exist = await _context.Proceedings.FirstOrDefaultAsync(p=>p.ProceedingNumber == proceedingResponse.ProceedingNumber);
        if (exist != null) return;
        var proceeding = new Proceeding
        {
            ProceedingNumber = proceedingResponse.ProceedingNumber,
            Title = proceedingResponse.Title,
        };
        _context.Proceedings.Add(proceeding);
        await _context.SaveChangesAsync();
    }

    public async Task SaveVotingDetails(VotingDetailsResponse votingDetailsResponse)
    {
        if (votingDetailsResponse == null)
            throw new ArgumentNullException(nameof(votingDetailsResponse));

        var proceeding = await _context.Proceedings
            .FirstOrDefaultAsync(p => p.ProceedingNumber == votingDetailsResponse.ProceedingNumber);
        if (proceeding == null)
            throw new ArgumentNullException(nameof(proceeding));
        var votingDetail = new VotingDetail
        {
            VotingNumber = votingDetailsResponse.VotingNumber,
            IdProceeding = proceeding.IdProceeding,
            Date = votingDetailsResponse.Date,
            Title = votingDetailsResponse.Title,
            Topic = votingDetailsResponse.Topic,
            Description = votingDetailsResponse.Description,
            YesVotesCount = votingDetailsResponse.YesVotesCount,
            NoVotesCount = votingDetailsResponse.NoVotesCount,
            AbstainCount = votingDetailsResponse.AbstainCount,
            NotParticipatingCount = votingDetailsResponse.NotParticipatingCount,
            TotalVoted = votingDetailsResponse.TotalVoted,
            MajorityType = votingDetailsResponse.MajorityType,
            MajorityVotes = votingDetailsResponse.MajorityVotes,
            Adopted = votingDetailsResponse.Adopted
        };

        _context.VotingDetails.Add(votingDetail);
        await _context.SaveChangesAsync();

        if (votingDetailsResponse.ClubVotes != null)
        {
            var clubVotes = votingDetailsResponse.ClubVotes
                .SelectMany(kvp => kvp.Value.Select(v =>
                    new ClubVote
                    {
                        IdVotingDetail = votingDetail.IdVotingDetail,
                        ClubName = kvp.Key,
                        VoteType = v.Key,
                        VoteCount = v.Value
                    }))
                .ToList();

            _context.ClubVotes.AddRange(clubVotes);
        }

        if (votingDetailsResponse.Votes != null)
        {
            var voteResponses = votingDetailsResponse.Votes.Select(vote => new VoteResponse
            {
                IdVotingDetail = votingDetail.IdVotingDetail,
                ClubName = vote.Club,
                FirstName = vote.FirstName,
                SecondName = vote.SecondName,
                LastName = vote.LastName,
                VoteType = vote.VoteType
            }).ToList();

            _context.VoteResponses.AddRange(voteResponses);
        }

        await _context.SaveChangesAsync();
    }




}
