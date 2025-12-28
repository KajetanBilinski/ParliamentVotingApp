using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class PrintInfoResponse
{
    [JsonPropertyName("title")]
    public string? PrintInfo { get; set; }
}
