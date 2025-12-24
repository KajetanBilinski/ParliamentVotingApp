using System.Threading.Tasks;
using ParliamentVotingApp.Contracts;

namespace ParliamentVotingApp;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IPVBackendAPI _pvBackendAPI;

    public Worker(ILogger<Worker> logger, IPVBackendAPI pVBackendAPI)
    {
        _logger = logger;
        _pvBackendAPI = pVBackendAPI;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var term = await _pvBackendAPI.GetCurrentTerm();
        _logger.LogDebug(term!.From.ToString());
        var proceedings = await _pvBackendAPI.GetCurrentProceedingVotings(term);
        Console.WriteLine();
    }
}
