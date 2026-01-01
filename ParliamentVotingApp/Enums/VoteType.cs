using System.Text.Json.Serialization;

namespace ParliamentVotingApp.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))] 
public enum VoteType
{
    YES, NO, ABSTAIN, NO_VOTE, ABSENT, VOTE_VALID, VOTE_INVALID, PRESENT
}
