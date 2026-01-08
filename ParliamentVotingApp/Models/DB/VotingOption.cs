using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParliamentVotingApp.Models.DB;

public class VotingOption
{
    [Key]
    public long IdVotingOption { get; set; }

    public long IdVotingDetail { get; set; }

    [ForeignKey(nameof(IdVotingDetail))]
    public VotingDetail? VotingDetail { get; set; }

    public int OptionIndex { get; set; }
    public string OptionName { get; set; } = null!;
    public int VotesCount { get; set; }
}
