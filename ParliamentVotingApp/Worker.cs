using ParliamentVotingApp.Contracts;

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
        _logger.LogInformation("Worker started at: {time}", DateTimeOffset.Now);
        while(!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
            try
            {
                await RunApplication(stoppingToken);
                _logger.LogInformation("Next run at: {time}", DateTimeOffset.Now.AddDays(1));
                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
            catch(Exception ex)
            {
                _logger.LogWarning("Worker encountered an error {error}, next try in 10 minutes", ex.Message);
                await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
            }
        }
    }

    private async Task RunApplication(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var _pvBackendAPI = scope.ServiceProvider.GetRequiredService<IPVBackendAPI>();
        var _databaseManager = scope.ServiceProvider.GetRequiredService<IDatabaseManager>();
        var term = await _pvBackendAPI.GetCurrentTerm();
        if(term == null) throw new Exception("Connection to api failed");
        var proceedingsAndVotingsDB = await _databaseManager.GetAllProceedingAndVotingNumbers();
        var proceedings = await _pvBackendAPI.GetProceedings(term!);
        if(proceedings == null) throw new Exception("Connection to api failed");
        foreach(var p in proceedings)
        {
            await _databaseManager.AddNewProceeding(p);
        }
        foreach(var proceeding in proceedings!)
        {
            stoppingToken.ThrowIfCancellationRequested();
            var votings = await _pvBackendAPI.GetVotingsForProceeding(term!, proceeding.ProceedingNumber);
            if(votings == null) throw new Exception("Connection to api failed");
            foreach(var voting in votings)
            {
                if(proceedingsAndVotingsDB.TryGetValue(proceeding.ProceedingNumber, out var votingNumbers))
                {
                    if(votingNumbers.Contains(voting.VotingNumber))
                        continue;
                }
                await _databaseManager.SaveVotingDetails(voting);
            }
        }
    }
}
