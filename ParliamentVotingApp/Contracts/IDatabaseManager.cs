using ParliamentVotingApp.Models.DB;
using ParliamentVotingApp.Models.DTO;

namespace ParliamentVotingApp.Contracts;

public interface IDatabaseManager
{
    Task SaveVotingDetails(VotingDetailsResponse votingDetailsResponse);
    Task<Dictionary<int, List<int>>> GetAllProceedingAndVotingNumbers();
    Task AddNewProceeding(ProceedingResponse proceedingResponse);
    Task<List<Proceeding>> GetAllProceedings();
}
