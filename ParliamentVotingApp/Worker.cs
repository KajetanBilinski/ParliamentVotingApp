using Microsoft.Extensions.Options;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Enums;
using ParliamentVotingApp.Models.DB;
using System.Threading.Tasks;

namespace ParliamentVotingApp;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public Worker(ILogger<Worker> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var _pvBackendAPI = scope.ServiceProvider.GetRequiredService<IPVBackendAPI>();
        var _databaseManager = scope.ServiceProvider.GetRequiredService<IDatabaseManager>();
        var term = await _pvBackendAPI.GetCurrentTerm();
        var proceedingsAndVotingsDB = await _databaseManager.GetAllProceedingAndVotingNumbers();
        var proceedings = await _pvBackendAPI.GetProceedings(term!);
        if (proceedings == null) return;
        foreach(var p in proceedings)
        {
            await _databaseManager.AddNewProceeding(p);
        }
        foreach (var proceeding in proceedings!)
        {
            if (proceedingsAndVotingsDB.ContainsKey(proceeding.ProceedingNumber)) continue;
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
