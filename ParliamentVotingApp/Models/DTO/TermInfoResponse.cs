using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class TermInfoResponse
{
    [JsonPropertyName("current")]
    public bool Current { get; set; }

    [JsonPropertyName("num")]
    public int Number { get; set; }
    [JsonPropertyName("from")]
    public DateOnly From { get; set; }
}

public class Prints
{
    [JsonPropertyName("count")]
    public int Count { get; set; }
    [JsonPropertyName("lastChanged")]
    public int LastChanged { get; set; }
    [JsonPropertyName("link")]
    public int Link { get; set; }
}