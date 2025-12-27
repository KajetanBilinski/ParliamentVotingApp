using Microsoft.Extensions.Options;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Enums;
using ParliamentVotingApp.Models.DB;
using System.Threading.Tasks;

namespace ParliamentVotingApp;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IPVBackendAPI _pvBackendAPI;
    private readonly IDatabaseManager _databaseManager;

    public Worker(ILogger<Worker> logger, IPVBackendAPI pVBackendAPI, IDatabaseManager databaseManager)
    {
        _logger = logger;
        _pvBackendAPI = pVBackendAPI;
        _databaseManager = databaseManager;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var term = await _pvBackendAPI.GetCurrentTerm();
        //var voting = await _pvBackendAPI.GetLastVoting(term!);
        //if (voting != null)
        //    await _databaseManager.SaveVotingDetails(voting);
        var proceedingsAndVotingsDB = await _databaseManager.GetAllProceedingAndVotingNumbers();
        var proceedings = await _pvBackendAPI.GetProceedings(term!); //24
        if (proceedings == null) return;
        foreach(var p in proceedings)
        {
            await _databaseManager.AddNewProceeding(p);
        }
        foreach (var proceeding in proceedings!)
        {
            
            var votings = await _pvBackendAPI.GetVotingsForProceeding(term!, proceeding.ProceedingNumber);
            if (votings != null)
            {
                foreach (var voting in votings)
                {
                    if (voting.VotingOptions != null) continue;
                    if (proceedingsAndVotingsDB.TryGetValue(proceeding.ProceedingNumber, out var votingNumbers))
                    {
                        if (votingNumbers.Contains(voting.VotingNumber))
                            continue;
                    }
                    await _databaseManager.SaveVotingDetails(voting);
                }
            }
        }
    }
}
