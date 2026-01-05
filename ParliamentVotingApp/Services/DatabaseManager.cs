using Microsoft.EntityFrameworkCore;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Enums;
using ParliamentVotingApp.Models.DB;
using ParliamentVotingApp.Models.DTO;
using System.Text;

namespace ParliamentVotingApp.Services;

public class DatabaseManager : IDatabaseManager
{
    private readonly ParliamentContext _context;

    public DatabaseManager(ParliamentContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<int, List<int>>> GetAllProceedingAndVotingNumbers()
    {
        var data = await _context.VotingDetails
            .AsNoTracking()
            .AsSplitQuery()
            .Include(v => v.Proceeding)
            .Select(v => new
            {
                v.Proceeding.ProceedingNumber,
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
        var votings = await _context.VotingDetails.Include(v => v.VotingOptions).Where(v => v.Proceeding.ProceedingNumber == proceedingNumber).ToListAsync();
        if (votings == null || votings.Count == 0) return new List<VotingDetail>();
        return votings;
    }

    public async Task<List<VotingDetail>> GetAllVotingsWithText(string text)
    {
        var votings = await _context.VotingDetails
            .AsNoTracking()
            .AsSplitQuery()
            .Include(v => v.Proceeding)
            .Where(v =>
                EF.Functions.Like(v.Title, $"%{text}%") ||
                EF.Functions.Like(v.Description, $"%{text}%") ||
                EF.Functions.Like(v.Topic, $"%{text}%"))
            .ToListAsync();
        if (votings == null || votings.Count == 0) return new List<VotingDetail>();
        return votings;
    }

    public async Task<VotingDetailsResponse?> GetVotingDetails(int proceedingNumber, int votingNumber)
    {
        var voting = await _context.VotingDetails
            .AsNoTracking()
            .AsSplitQuery()
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
        var optionIndexNameMap = (voting.VotingOptions ?? Enumerable.Empty<VotingOption>())
            .ToDictionary(o => o.OptionIndex, o => o.OptionName);

        var voteResponsesDb = voting.VoteResponses ?? Enumerable.Empty<VoteResponse>();
        var groupedByMp = voteResponsesDb
            .GroupBy(vr => new { vr.ClubName, vr.FirstName, vr.SecondName, vr.LastName })
            .ToList();

        var votesDto = new List<VoteResponseDTO>(groupedByMp.Count);

        foreach (var grp in groupedByMp)
        {
            var grpList = grp.ToList();
            var listEntries = grpList.Where(x => x.OptionIndex != null).ToList();
            var singleEntry = grpList.FirstOrDefault(x => x.OptionIndex == null);

            Dictionary<string, VoteType>? listVotes = null;
            if (listEntries.Count > 0)
            {
                listVotes = listEntries
                    .GroupBy(x => x.OptionIndex!.Value)
                    .ToDictionary(
                        g => optionIndexNameMap.TryGetValue(g.Key, out var name) ? name : g.Key.ToString(),
                        g => g.First().VoteType
                    );
            }

            var mainVoteType = singleEntry != null
                ? singleEntry.VoteType
                : (listVotes != null && listVotes.Count > 0 ? VoteType.VOTE_VALID : VoteType.NO_VOTE);

            votesDto.Add(new VoteResponseDTO
            {
                Club = grp.Key.ClubName,
                FirstName = grp.Key.FirstName,
                SecondName = grp.Key.SecondName,
                LastName = grp.Key.LastName,
                VoteType = mainVoteType,
                ListVotes = listVotes
            });
        }
        Dictionary<string, Dictionary<string, Dictionary<VoteType, int>>>? clubListVotes = null;
        var votesWithListVotes = voteResponsesDb.Where(vr => vr.OptionIndex != null).ToList();

        if (votesWithListVotes.Count > 0)
        {
            clubListVotes = votesWithListVotes
                .GroupBy(vr => vr.ClubName)
                .ToDictionary(
                    clubGroup => clubGroup.Key,
                    clubGroup => clubGroup
                        .GroupBy(vr => optionIndexNameMap.TryGetValue(vr.OptionIndex!.Value, out var name)
                            ? name
                            : vr.OptionIndex!.Value.ToString())
                        .ToDictionary(
                            optionGroup => optionGroup.Key,
                            optionGroup => optionGroup
                                .GroupBy(vr => vr.VoteType)
                                .ToDictionary(
                                    voteGroup => voteGroup.Key,
                                    voteGroup => voteGroup.Count()
                                )
                        )
                );
        }

        var response = new VotingDetailsResponse
        {
            VotingNumber = votingNumber,
            ProceedingNumber = proceedingNumber,
            Date = voting.Date,
            Title = voting.Title,
            Topic = voting.Topic,
            Description = voting.Description,
            PrintsInfo = voting.PrintInfo,

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

            Votes = votesDto,

            ClubVotes = voting.ClubVotes?
                .GroupBy(cv => cv.ClubName)
                .ToDictionary(
                    g => g.Key,
                    g => g.ToDictionary(
                        x => x.VoteType,
                        x => x.VoteCount
                    )
                ),

            ClubListVotes = clubListVotes
        };

        return response;
    }

    public async Task GetTopFiveBestAttendanceMPs()
    {
        // Implementation for statistics can be added here
    }


    public async Task AddNewProceeding(ProceedingResponse proceedingResponse)
    {
        var exist = await _context.Proceedings.FirstOrDefaultAsync(p => p.ProceedingNumber == proceedingResponse.ProceedingNumber);
        if (exist != null) return;
        StringBuilder datesBuilder = new StringBuilder();
        proceedingResponse?.Dates?.ForEach(d => datesBuilder.Append(d.ToString("MM-dd-yyyy")).Append(" "));
        var proceeding = new Proceeding
        {
            ProceedingNumber = proceedingResponse.ProceedingNumber,
            Title = proceedingResponse.Title,
            Dates = datesBuilder.ToString()
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
            PrintInfo = votingDetailsResponse.PrintsInfo,
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

        if (votingDetailsResponse.VotingOptions != null)
        {
            var votingOptions = votingDetailsResponse.VotingOptions
                .Select(option => new VotingOption
                {
                    IdVotingDetail = votingDetail.IdVotingDetail,
                    OptionIndex = option.OptionIndex,
                    OptionName = option.OptionName,
                    VotesCount = option.VotesCount
                })
                .ToList();
            _context.VotingOptions.AddRange(votingOptions);
        }

        if (votingDetailsResponse.Votes != null)
        {
            var voteResponses = new List<VoteResponse>();
            var hasOptions = votingDetailsResponse.VotingOptions != null && votingDetailsResponse.VotingOptions.Count > 0;
            foreach (var vote in votingDetailsResponse.Votes)
            {
                if (hasOptions && vote.ListVotes != null && vote.ListVotes.Count > 0)
                {
                    foreach (var kvp in vote.ListVotes)
                    {
                        if (!int.TryParse(kvp.Key, out var optionIndex))
                        {
                            continue;
                        }
                        voteResponses.Add(new VoteResponse
                        {
                            IdVotingDetail = votingDetail.IdVotingDetail,
                            ClubName = vote.Club,
                            FirstName = vote.FirstName,
                            SecondName = vote.SecondName,
                            LastName = vote.LastName,
                            OptionIndex = optionIndex,
                            VoteType = kvp.Value
                        });
                    }
                }
                else
                {

                    voteResponses.Add(new VoteResponse
                    {
                        IdVotingDetail = votingDetail.IdVotingDetail,
                        ClubName = vote.Club,
                        FirstName = vote.FirstName,
                        SecondName = vote.SecondName,
                        LastName = vote.LastName,
                        OptionIndex = null,
                        VoteType = vote.VoteType
                    });
                }
            }

            if (voteResponses.Count > 0)
                _context.VoteResponses.AddRange(voteResponses);
        }

        await _context.SaveChangesAsync();
    }
}
