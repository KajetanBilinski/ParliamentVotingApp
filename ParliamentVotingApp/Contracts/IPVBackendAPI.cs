using ParliamentVotingApp.Models.DTO;

namespace ParliamentVotingApp.Contracts;

public interface IPVBackendAPI
{
    Task<TermInfoResponse?> GetCurrentTerm();
    Task<List<ProceedingResponse>?> GetProceedings(TermInfoResponse termInfoResponse);
    Task<List<VotingDetailsResponse>?> GetVotingsForProceeding(TermInfoResponse termInfoResponse, int proceedingNumber);
    Task<ProceedingResponse?> GetLastOrCurrentProceeding(TermInfoResponse termInfoResponse);
    Task<VotingDetailsResponse?> GetLastVoting(TermInfoResponse termInfoResponse);
    Task<List<VotingDetailsResponse>?> GetCurrentProceedingVotings(TermInfoResponse termInfoResponse);
}
