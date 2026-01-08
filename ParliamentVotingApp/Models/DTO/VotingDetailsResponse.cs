using ParliamentVotingApp.Enums;
using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Models.DTO;

public class VotingDetailsResponse
{
    [JsonIgnore]
    public int ProceedingNumber { get; set; }
    [JsonPropertyName("votingNumber")]
    public int VotingNumber { get; set; }
    [JsonPropertyName("date")]
    public DateTime Date { get; set; }
    [JsonPropertyName("title")]
    public string? Title { get; set; }
    [JsonPropertyName("printsInfo")]
    public string? PrintsInfo { get; set; }
    [JsonPropertyName("topic")]
    public string? Topic { get; set; }
    [JsonPropertyName("description")]
    public string? Description { get; set; }
    [JsonPropertyName("yes")]
    public int YesVotesCount { get; set; }
    [JsonPropertyName("no")]
    public int NoVotesCount { get; set; }
    [JsonPropertyName("notParticipating")]
    public int NotParticipatingCount { get; set; }
    [JsonPropertyName("abstain")]
    public int AbstainCount { get; set; }
    [JsonPropertyName("totalVoted")]
    public int TotalVoted { get; set; }
    [JsonPropertyName("majorityType")]
    public string? MajorityType { get; set; }
    [JsonPropertyName("majorityVotes")]
    public int? MajorityVotes { get; set; }
    [JsonPropertyName("votes")]
    public IList<VoteResponseDTO>? Votes { get; set; }
    [JsonPropertyName("votingOptions")]
    public List<VotingOptions>? VotingOptions { get; set; }
    [JsonIgnore]
    public Dictionary<string, Dictionary<VoteType, int>>? ClubVotes { get; set; }
    public Dictionary<string, Dictionary<string, Dictionary<VoteType, int>>>? ClubListVotes { get; set; }
    [JsonIgnore]
    public bool Adopted
    {
        get
        {
            return MajorityType switch
            {
                "SIMPLE_MAJORITY" => YesVotesCount > NoVotesCount,

                "ABSOLUTE_MAJORITY" =>
                    YesVotesCount > (NoVotesCount + AbstainCount),

                "STATUTORY_MAJORITY" =>
                    YesVotesCount >= 231,

                "ABSOLUTE_STATUTORY_MAJORITY" =>
                    YesVotesCount >= 231,

                "MAJORITY_THREE_FIFTHS" =>
                    YesVotesCount >= 276,

                _ => false
            };
        }
    }

    public Dictionary<string, bool> AdoptedList
    {
        get
        {
            var result = new Dictionary<string, bool>();

            if(VotingOptions == null || VotingOptions.Count == 0)
                return result;

            switch(MajorityType)
            {
                case "SIMPLE_MAJORITY":
                case "ABSOLUTE_MAJORITY":
                {
                    double requiredVotes = MajorityVotes == null ? (double)MajorityVotes : TotalVoted / 2.0;

                    foreach(var option in VotingOptions)
                        result[option.OptionName] = option.VotesCount > requiredVotes;

                    break;
                }

                case "STATUTORY_MAJORITY":
                case "ABSOLUTE_STATUTORY_MAJORITY":
                    foreach(var option in VotingOptions)
                        result[option.OptionName] = option.VotesCount >= 231;
                    break;

                case "MAJORITY_THREE_FIFTHS":
                    foreach(var option in VotingOptions)
                        result[option.OptionName] = option.VotesCount >= 276;
                    break;

                default:
                    foreach(var option in VotingOptions)
                        result[option.OptionName] = false;
                    break;
            }

            return result;
        }
    }
}
