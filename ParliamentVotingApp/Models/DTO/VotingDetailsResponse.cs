using ParliamentVotingApp.Enums;
using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class VotingDetailsResponse
{
    [JsonPropertyName("votingNumber")]
    public int VotingNumber { get; set; }
    [JsonPropertyName("date")]
    public DateTime Date { get; set; }
    [JsonPropertyName("title")]
    public string? Title { get; set; }
    [JsonPropertyName("topic")]
    public string? Topic { get; set; }
    [JsonPropertyName("description")]
    public string? Description { get; set; }
    [JsonPropertyName("yes")]
    public int YesVotesCount { get; set; }
    [JsonPropertyName("no")]
    public int NoVotesCount { get; set; }
    [JsonPropertyName("notParticipating")]
    public int NotParticipatingCount { get; set; }
    [JsonPropertyName("abstain")]
    public int AbstainCount { get; set; }
    [JsonPropertyName("totalVoted")]
    public int TotalVoted { get; set; }
    [JsonPropertyName("majorityType")]
    public string? MajorityType { get; set; }
    [JsonPropertyName("majorityVotes")]
    public int? MajorityVotes { get; set; }
    [JsonPropertyName("votes")]
    public IList<VoteResponse>? Votes { get; set; }
    [JsonPropertyName("votingOptions")]
    public List<VotingOptions>? VotingOptions { get; set; }
    [JsonIgnore]
    public Dictionary<string,Dictionary<VoteType,int>>? ClubVotes { get; set; }
    public Dictionary<string, Dictionary<string, Dictionary<VoteType, int>>>? ClubListVotes { get; set; }
    [JsonIgnore]
    public bool Adopted => MajorityVotes == null? YesVotesCount > NoVotesCount : YesVotesCount >= MajorityVotes;
}
