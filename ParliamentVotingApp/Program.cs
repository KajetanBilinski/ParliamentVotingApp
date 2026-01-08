using Microsoft.EntityFrameworkCore;
using ParliamentVotingApp;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Options;
using ParliamentVotingApp.Services;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<ParliamentContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("Default"),
        new MySqlServerVersion(new Version(12, 1, 0))
    )
);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});
builder.Services.AddHostedService<Worker>();
builder.Services.AddHttpClient<IPVBackendAPI, PVBackendAPI>();
builder.Services.AddScoped<IDatabaseManager, DatabaseManager>();
builder.Services.AddScoped<IPVBackendAPI, PVBackendAPI>();
builder.Services.Configure<ExternalAPIOptions>(builder.Configuration.GetSection(ExternalAPIOptions.SectionKey));
builder.Services.Configure<DatabaseOptions>(builder.Configuration.GetSection(DatabaseOptions.SectionKey));
builder.Services.AddControllers();
var app = builder.Build();

app.UseCors("AllowAll");
app.UseRouting();
app.MapControllers();

app.Run();