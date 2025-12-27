using ParliamentVotingApp.Models.DTO;

namespace ParliamentVotingApp.Contracts;

public interface IDatabaseManager
{
    Task SaveVotingDetails(VotingDetailsResponse votingDetailsResponse);
    Task<Dictionary<int, List<int>>> GetAllProceedingAndVotingNumbers();
}
