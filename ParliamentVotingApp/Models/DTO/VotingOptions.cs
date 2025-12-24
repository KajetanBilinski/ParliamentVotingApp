using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class VotingOptions
{
    [JsonPropertyName("optionIndex")]
    public required int OptionIndex { get; set; }
    [JsonPropertyName("option")]
    public required string OptionName { get; set; }
    [JsonPropertyName("votes")]
    public required int VotesCount { get; set; }
}
