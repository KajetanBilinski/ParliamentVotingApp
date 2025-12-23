using ParliamentVotingApp.Models.DTO;

namespace ParliamentVotingApp.Contracts;

public interface IPVBackendAPI
{
    Task<TermInfoResponse?> GetCurrentTerm();
}
