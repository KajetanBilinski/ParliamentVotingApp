using Microsoft.EntityFrameworkCore;
using ParliamentVotingApp.Models.DB;

namespace ParliamentVotingApp;

public class ParliamentContext : DbContext
{
    public DbSet<VotingDetail> VotingDetails { get; set; }
    public DbSet<VotingOption> VotingOptions { get; set; }
    public DbSet<ClubVote> ClubVotes { get; set; }
    public DbSet<Proceeding> Proceedings { get; set; }
    public DbSet<VoteResponse> VoteResponses { get; set; }

    public ParliamentContext(DbContextOptions<ParliamentContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<VotingDetail>()
            .HasOne(v => v.Proceeding)
            .WithMany(p => p.VotingDetails)
            .HasForeignKey(v => v.IdProceeding) // <- tutaj kolumna w tabeli
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ClubVote>()
            .HasOne(c => c.VotingDetail)
            .WithMany(v => v.ClubVotes)
            .HasForeignKey(c => c.IdVotingDetail)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VoteResponse>()
            .HasOne(r => r.VotingDetail)
            .WithMany(v => v.VoteResponses)
            .HasForeignKey(r => r.IdVotingDetail)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VotingOption>()
            .HasOne(o => o.VotingDetail)
            .WithMany(v => v.VotingOptions)
            .HasForeignKey(o => o.IdVotingDetail)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ClubVote>()
            .Property(c => c.VoteType)
            .HasConversion<string>();

        modelBuilder.Entity<VoteResponse>()
            .Property(r => r.VoteType)
            .HasConversion<string>();
    }
}
