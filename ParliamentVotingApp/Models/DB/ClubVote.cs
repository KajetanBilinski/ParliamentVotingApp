using ParliamentVotingApp.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParliamentVotingApp.Models.DB;

public class ClubVote
{
    [Key]
    public long IdClubVote { get; set; }

    public long IdVotingDetail { get; set; }
    [ForeignKey(nameof(IdVotingDetail))]
    public VotingDetail? VotingDetail { get; set; }

    public string ClubName { get; set; } = null!;

    public VoteType VoteType { get; set; }

    public int VoteCount { get; set; }
}

