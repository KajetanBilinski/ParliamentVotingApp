using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class TermInfoResponse
{
    [JsonPropertyName("current")]
    public bool Current { get; set; }

    [JsonPropertyName("num")]
    public int Number { get; set; }
}
