using Microsoft.Extensions.DependencyInjection;
using ParliamentVotingApp;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Options;
using ParliamentVotingApp.Services;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddHostedService<Worker>();
builder.Services.AddHttpClient<IPVBackendAPI, PVBackendAPI>();
builder.Services.AddTransient<IXIntegrationService, XIntegrationService>();
builder.Services.AddTransient<IDatabaseManager, DatabaseManager>();
builder.Services.Configure<ExternalAPIOptions>(builder.Configuration.GetSection(ExternalAPIOptions.SectionKey));

builder.Services.AddTransient<IPVBackendAPI, PVBackendAPI>();

var host = builder.Build();
host.Run();