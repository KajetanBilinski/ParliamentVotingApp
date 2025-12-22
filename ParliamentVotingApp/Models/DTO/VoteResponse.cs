using ParliamentVotingApp.Enums;
using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public sealed class VoteResponse
{
    [JsonPropertyName("club")]
    public string? Club { get; set; }
    [JsonPropertyName("firstName")]
    public string? FirstName { get; set; }
    [JsonPropertyName("secondName")]
    public string? SecondName { get; set; }
    [JsonPropertyName("lastName")]
    public string? LastName { get; set; }
    [JsonPropertyName("vote")]
    public VoteType VoteVal { get; set; }
}
