using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace ParliamentVotingApp.Models.DB;

public class Proceeding
{
    [Key]
    public long IdProceeding { get; set; } 

    public int ProceedingNumber { get; set; }
    public string? Title { get; set; }

    public ICollection<VotingDetail> VotingDetails { get; set; } = new List<VotingDetail>();
}
