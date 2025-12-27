using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class ProceedingResponse
{
    [JsonPropertyName("proceeding")]
    public int ProceedingNumber { get; set; }
}
