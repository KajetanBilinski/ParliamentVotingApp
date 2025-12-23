using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class VotingDetailsResponse
{
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
    [JsonPropertyName("votes")]
    public IList<VoteResponse>? Votes { get; set; }
    [JsonIgnore]
    public bool Adopted => YesVotesCount > NoVotesCount;
}
