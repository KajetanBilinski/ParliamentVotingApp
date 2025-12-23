
using ParliamentVotingApp.Contracts;
using System.Threading.Tasks;

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
        var val = await _pvBackendAPI.GetCurrentTerm();
        _logger.LogDebug(val!.From.ToString());
    }
}
