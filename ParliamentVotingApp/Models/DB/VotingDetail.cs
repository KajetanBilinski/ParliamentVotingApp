using ParliamentVotingApp.Models.DTO;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace ParliamentVotingApp.Models.DB;

public class VotingDetail
{
    [Key]
    public long IdVotingDetail { get; set; }
    public long IdProceeding { get; set; }
    public int VotingNumber { get; set; }
    public DateTime Date { get; set; }
    public string? Title { get; set; }
    public string? Topic { get; set; }
    public string? Description { get; set; }
    public int YesVotesCount { get; set; }
    public int NoVotesCount { get; set; }
    public int NotParticipatingCount { get; set; }
    public int AbstainCount { get; set; }
    public int TotalVoted { get; set; }
    public string? MajorityType { get; set; }
    public int? MajorityVotes { get; set; }
    public bool Adopted { get; set; }
    public Proceeding Proceeding { get; set; } = null!;
    public ICollection<VotingOption> VotingOptions { get; set; } = new List<VotingOption>();
    public ICollection<ClubVote> ClubVotes { get; set; } = new List<ClubVote>();
    public ICollection<VoteResponse> VoteResponses { get; set; } = new List<VoteResponse>();
}
