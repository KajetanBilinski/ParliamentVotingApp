using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ParliamentVotingApp;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Options;
using ParliamentVotingApp.Services;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<ParliamentContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("Default"),
        new MySqlServerVersion(new Version(12, 1, 0))
    ),
    ServiceLifetime.Singleton
);
builder.Services.AddHostedService<Worker>();
builder.Services.AddHttpClient<IPVBackendAPI, PVBackendAPI>();
builder.Services.AddSingleton<IXIntegrationService, XIntegrationService>();
builder.Services.AddSingleton<IDatabaseManager, DatabaseManager>();
builder.Services.AddSingleton<IPVBackendAPI, PVBackendAPI>();
builder.Services.Configure<ExternalAPIOptions>(builder.Configuration.GetSection(ExternalAPIOptions.SectionKey));
builder.Services.Configure<DatabaseOptions>(builder.Configuration.GetSection(DatabaseOptions.SectionKey));

var host = builder.Build();
host.Run();