using ParliamentVotingApp;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Services;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

builder.Services.AddHostedService<Worker>();
builder.Services.AddHttpClient<IPVBackendAPI, PVBackendAPI>();
builder.Services.AddTransient<IXIntegrationService, XIntegrationService>();
builder.Services.AddTransient<IDatabaseManager, DatabaseManager>();
builder.Services.AddTransient<IPVBackendAPI, PVBackendAPI>();

app.Run();