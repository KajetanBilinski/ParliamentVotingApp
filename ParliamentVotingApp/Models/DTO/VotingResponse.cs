using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class VotingResponse
{
    [JsonPropertyName("abstain")]
    public int AbstainCount { get; set; }
    [JsonPropertyName("date")]
    public DateTime Date { get; set; }
    [JsonPropertyName("yes")]
    public int YesVotesCount { get; set; }
    [JsonPropertyName("no")]
    public int NoVotesCount { get; set; }
    [JsonPropertyName("notParticipating")]
    public int NotParticipatingCount { get; set; }
    [JsonPropertyName("totalVoted")]
    public int TotalVoted { get; set; }
    [JsonPropertyName("title")]
    public string? Title { get; set; }
    [JsonPropertyName("topic")]
    public string? Topic { get; set; }
    [JsonPropertyName("votingNumber")]
    public int VotingNumber { get; set; }
    [JsonIgnore]
    public bool Adopted => YesVotesCount > NoVotesCount;
    [JsonIgnore]
    public int ProceedingNumber { get; set; }
}
