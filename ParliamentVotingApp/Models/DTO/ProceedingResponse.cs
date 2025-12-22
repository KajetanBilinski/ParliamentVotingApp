using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class ProceedingResponse
{
    [JsonPropertyName("date")]
    public DateTime Date { get; set; }
    [JsonPropertyName("proceeding")]
    public int ProceedingNumber { get; set; }
    [JsonPropertyName("votingsNum")]
    public int VotingsNumber { get; set; }
}
