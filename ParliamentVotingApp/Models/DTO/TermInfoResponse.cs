using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class TermInfoResponse
{
    [JsonPropertyName("current")]
    public required bool Current { get; set; }

    [JsonPropertyName("num")]
    public required int Number { get; set; }
    [JsonPropertyName("from")]
    public required DateOnly From { get; set; }
    [JsonPropertyName("to")]
    public DateOnly? To { get; set; }
}