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
    [JsonPropertyName("prints")]
    public Prints? Prints { get; set; }
}

public class Prints
{
    [JsonPropertyName("count")]
    public required int Count { get; set; }
    [JsonPropertyName("lastChanged")]
    public required DateTime LastChanged { get; set; }
    [JsonPropertyName("link")]
    public required string Link { get; set; }
}