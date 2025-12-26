using ParliamentVotingApp.Enums;
using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public sealed class VoteResponse
{
    [JsonPropertyName("club")]
    public required string Club { get; set; }
    [JsonPropertyName("firstName")]
    public required string FirstName { get; set; }
    [JsonPropertyName("secondName")]
    public string? SecondName { get; set; }
    [JsonPropertyName("lastName")]
    public required string LastName { get; set; }
    [JsonPropertyName("vote")]
    public VoteType VoteType { get; set; }
    [JsonPropertyName("listVotes")]
    public Dictionary<string, VoteType>? ListVotes { get; set; }
}