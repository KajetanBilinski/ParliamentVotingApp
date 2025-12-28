using ParliamentVotingApp.Enums;

namespace ParliamentVotingApp.Models.DTO;

public class ClubVoteItem
{
    public string ClubName { get; set; } = null!;
    public VoteType VoteType { get; set; }
    public int VoteCount { get; set; }
}
