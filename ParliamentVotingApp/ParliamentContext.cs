using Microsoft.EntityFrameworkCore;
using ParliamentVotingApp.Models.DB;

namespace ParliamentVotingApp;

public class ParliamentContext : DbContext
{
    public DbSet<VotingDetail> VotingDetails { get; set; }
    public DbSet<VotingOption> VotingOptions { get; set; }
    public DbSet<ClubVote> ClubVotes { get; set; }
    public DbSet<VoteResponse> VoteResponses { get; set; }

    public ParliamentContext(DbContextOptions<ParliamentContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder
            .Entity<ClubVote>()
            .Property(x => x.VoteType)
            .HasConversion<string>();

        modelBuilder
            .Entity<VoteResponse>()
            .Property(x => x.VoteType)
            .HasConversion<string>();
    }
}
