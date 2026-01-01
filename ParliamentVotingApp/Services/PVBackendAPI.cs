using System.Collections.Generic;
using System.Net.Http.Json;
using System.Net.Mime;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Enums;
using ParliamentVotingApp.Models.DTO;
using ParliamentVotingApp.Options;

namespace ParliamentVotingApp.Services;

public class PVBackendAPI : IPVBackendAPI
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly ILogger<PVBackendAPI> _logger;

    public PVBackendAPI(
        HttpClient httpClient,
        IOptions<ExternalAPIOptions> options,
        ILogger<PVBackendAPI> logger
    )
    {
        _httpClient = httpClient;
        _baseUrl = options.Value.BaseURL;
        _logger = logger;
    }

    public async Task<TermInfoResponse?> GetCurrentTerm()
    {
        try
        {
            _logger.LogDebug($"Request URL: {_baseUrl}/term");
            var terms = await _httpClient.GetFromJsonAsync<List<TermInfoResponse>>(
                $"{_baseUrl}/term"
            );
            if (terms == null)
                return null;
            return terms.FirstOrDefault(t => t.Current);
        }
        catch (Exception ex)
        {
            _logger.LogError("Error during fetching current term");
        }
        return null;
    }

    public async Task<List<ProceedingResponse>?> GetProceedings(TermInfoResponse termInfoResponse)
    {
        try
        {
            _logger.LogDebug($"Request URL: {_baseUrl}/term{termInfoResponse.Current}/proceedings");
            var proceedings = await _httpClient.GetFromJsonAsync<List<ProceedingResponse>>(
                $"{_baseUrl}/term{termInfoResponse.Number}/proceedings"
            );
            if (proceedings == null)
                return null;
            return proceedings;
        }
        catch (Exception)
        {
            _logger.LogError("Error during fetching proceedings");
        }
        return null;
    }

    public async Task<List<VotingDetailsResponse>?> GetVotingsForProceeding(
        TermInfoResponse termInfoResponse,
        int proceedingNumber
    )
    {
        try
        {
            _logger.LogDebug(
                $"Request URL: {_baseUrl}/term{termInfoResponse.Number}/votings/{proceedingNumber}"
            );
            var votings = await _httpClient.GetFromJsonAsync<List<VotingResponse>>(
                $"{_baseUrl}/term{termInfoResponse.Number}/votings/{proceedingNumber}"
            );
            if (votings == null)
                return null;
            List<VotingDetailsResponse> votingDetails = new List<VotingDetailsResponse>();
            foreach (var voting in votings)
            {
                var votingDetail = await _httpClient.GetFromJsonAsync<VotingDetailsResponse>(
                    $"{_baseUrl}/term{termInfoResponse.Number}/votings/{proceedingNumber}/{voting.VotingNumber}"
                );
                if (votingDetail == null)
                    continue;
                votingDetail =
                    (votingDetail.VotingOptions == null)
                        ? HandleClubVotes(votingDetail)
                        : HandleClubListVotes(votingDetail);
                votingDetail.ProceedingNumber = proceedingNumber;
                var printNumbers = ExtractPrintInfo(votingDetail.Title);
                if (printNumbers == null || printNumbers.Count == 0)
                    printNumbers = ExtractPrintInfo(votingDetail.Topic);

                StringBuilder printsInfoBuilder = new StringBuilder();
                foreach (var printNumber in printNumbers)
                {
                    var printTitle = await GetPrintTitleForVoting(termInfoResponse, printNumber);
                    if (!string.IsNullOrEmpty(printTitle) && !printsInfoBuilder.ToString().Contains(printTitle))
                    {
                        printTitle = $"Druk {printNumber} - {printTitle}";
                        printsInfoBuilder.AppendLine(printTitle);
                    }
                }
                votingDetail.PrintsInfo = printsInfoBuilder.ToString();
                votingDetails.Add(votingDetail);
            }
            if (votingDetails == null || votingDetails.Count == 0)
                return null;
            return votingDetails;
        }
        catch (Exception)
        {
            _logger.LogError("Error during fetching votings details for proceeding");
        }
        return null;
    }

    private List<string> ExtractPrintInfo(string? title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return new List<string>();
        }

        var prints = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var numberPattern = new Regex(
            @"\b\d+(?:-[A-Za-z])?\b",
            RegexOptions.Compiled
        );
        var comprehensivePattern = new Regex(
            @"(?i)\bdruk\w*\s+nr\s+([^)]+?)(?=\s*\))",
            RegexOptions.Compiled
        );
        foreach (Match match in comprehensivePattern.Matches(title))
        {
            var segment = match.Groups[1].Value;
            foreach (Match num in numberPattern.Matches(segment))
            {
                prints.Add(num.Value);
            }
        }
        if (prints.Count == 0)
        {
            var rangePattern = new Regex(
                @"(?i)\bdruk\w*\s+nr\s+((?:\d+(?:-[A-Za-z])?(?:[,\s]|(?:\s+i\s+)|(?:\s+oraz\s+))+)+\d+(?:-[A-Za-z])?)",
                RegexOptions.Compiled
            );

            foreach (Match rangeMatch in rangePattern.Matches(title))
            {
                var segment = rangeMatch.Groups[1].Value;
                foreach (Match num in numberPattern.Matches(segment))
                {
                    prints.Add(num.Value);
                }
            }
        }

        if (prints.Count == 0)
        {
            var fallbackPattern = new Regex(
                @"(?i)\bdruk\w*\s+nr\b[^\d]*(\d+(?:-[A-Za-z])?)",
                RegexOptions.Compiled
            );

            foreach (Match m in fallbackPattern.Matches(title))
            {
                if (m.Groups.Count > 1)
                {
                    prints.Add(m.Groups[1].Value);
                }
            }
        }

        return prints.Count == 0
            ? new List<string>()
            : prints
                .Select(p => p.Trim())
                .Where(p => p.Length > 0)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(p => p, StringComparer.OrdinalIgnoreCase)
                .ToList();
    }

    private VotingDetailsResponse HandleClubListVotes(VotingDetailsResponse votingDetail)
    {
        var options = votingDetail.VotingOptions!;
        var votes = votingDetail.Votes!;

        votingDetail.ClubListVotes = votes
            .SelectMany(vote =>
                options.Select(
                    (option, index) =>
                    {
                        var key = (index + 1).ToString();

                        var voteType =
                            vote.ListVotes != null
                            && vote.ListVotes.TryGetValue(key, out var listVote)
                                ? listVote
                                : vote.VoteType;

                        return new
                        {
                            vote.Club,
                            option.OptionName,
                            VoteType = voteType,
                        };
                    }
                )
            )
            .GroupBy(x => x.Club)
            .ToDictionary(
                clubGroup => clubGroup.Key,
                clubGroup =>
                    clubGroup
                        .GroupBy(x => x.OptionName)
                        .ToDictionary(
                            optionGroup => optionGroup.Key,
                            optionGroup =>
                                optionGroup
                                    .GroupBy(x => x.VoteType)
                                    .ToDictionary(
                                        voteGroup => voteGroup.Key,
                                        voteGroup => voteGroup.Count()
                                    )
                        )
            );

        return votingDetail;
    }

    private VotingDetailsResponse HandleClubVotes(VotingDetailsResponse votingDetail)
    {
        votingDetail.ClubVotes = votingDetail
            .Votes!.GroupBy(v => v.Club)
            .ToDictionary(
                g => g.Key,
                g => g.GroupBy(v => v.VoteType).ToDictionary(vg => vg.Key, vg => vg.Count())
            );
        return votingDetail;
    }

    public async Task<ProceedingResponse?> GetLastOrCurrentProceeding(
        TermInfoResponse termInfoResponse
    )
    {
        try
        {
            var proceedings = await GetProceedings(termInfoResponse);
            if (proceedings == null || proceedings.Count == 0)
                return null;
            var proceeding = proceedings
                .OrderByDescending(p => p.ProceedingNumber)
                .FirstOrDefault();
            if (proceeding == null)
                return null;
            return proceeding;
        }
        catch (Exception)
        {
            _logger.LogError("Error during fetching current proceeding");
        }
        return null;
    }

    public async Task<List<VotingDetailsResponse>?> GetCurrentProceedingVotings(
        TermInfoResponse termInfoResponse
    )
    {
        try
        {
            var proceeding = await GetLastOrCurrentProceeding(termInfoResponse);
            if (proceeding == null)
                return null;
            var votingList = await GetVotingsForProceeding(
                termInfoResponse,
                proceeding.ProceedingNumber
            );
            if (votingList == null)
                return null;
            return votingList;
        }
        catch (Exception)
        {
            _logger.LogError("Error during fetching current proceeding votings");
        }
        return null;
    }

    public async Task<VotingDetailsResponse?> GetLastVoting(TermInfoResponse termInfoResponse)
    {
        var proceeding = await GetLastOrCurrentProceeding(termInfoResponse);
        if (proceeding == null)
            return null;
        var votings = await _httpClient.GetFromJsonAsync<List<VotingResponse>>(
            $"{_baseUrl}/term{termInfoResponse.Number}/votings/{proceeding.ProceedingNumber}"
        );
        if (votings == null)
            return null;
        var lastVotingNumber = votings
            .OrderByDescending(v => v.VotingNumber)
            .FirstOrDefault()
            ?.VotingNumber;
        if (lastVotingNumber == null)
            return null;
        var lastDetailedVoting = await _httpClient.GetFromJsonAsync<VotingDetailsResponse>(
            $"{_baseUrl}/term{termInfoResponse.Number}/votings/{proceeding.ProceedingNumber}/{lastVotingNumber}"
        );
        if (lastDetailedVoting == null) return null;
        lastDetailedVoting =
            (lastDetailedVoting.VotingOptions == null)
                ? HandleClubVotes(lastDetailedVoting)
                : HandleClubListVotes(lastDetailedVoting);
        return lastDetailedVoting;
    }

    public async Task<VotingDetailsResponse?> GetVotingForProceeding(TermInfoResponse termInfoResponse,
        int proceedingNumber, int votingNumber)
    {
        var detailedVoting = await _httpClient.GetFromJsonAsync<VotingDetailsResponse>(
            $"{_baseUrl}/term{termInfoResponse.Number}/votings/{proceedingNumber}/{votingNumber}"
        );
        if (detailedVoting == null) return null;
        detailedVoting =
            (detailedVoting.VotingOptions == null)
                ? HandleClubVotes(detailedVoting)
                : HandleClubListVotes(detailedVoting);
        detailedVoting.ProceedingNumber = proceedingNumber;
        return detailedVoting;
    }

    public async Task<string?> GetPrintTitleForVoting(TermInfoResponse termInfoResponse, string printNumber)
    {
        var printInfo = await _httpClient.GetFromJsonAsync<VotingDetailsResponse>(
            $"{_baseUrl}/term{termInfoResponse.Number}/prints/{printNumber}"
        );
        return printInfo?.Title;
    }
}
