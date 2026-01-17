using ParliamentVotingApp.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParliamentVotingApp.Models.DB;

public class VoteResponse
{
    [Key]
    public long IdVoteResponse { get; set; }

    public long IdVotingDetail { get; set; }
    [ForeignKey(nameof(IdVotingDetail))]
    public VotingDetail? VotingDetail { get; set; }

    public string ClubName { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string? SecondName { get; set; }
    public string LastName { get; set; } = null!;
    public int? OptionIndex { get; set; }
    public VoteType VoteType { get; set; }
}