using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class ProceedingResponse
{
    [JsonPropertyName("number")]
    public int ProceedingNumber { get; set; }
    [JsonPropertyName("title")]
    public string? Title { get; set; }
}
