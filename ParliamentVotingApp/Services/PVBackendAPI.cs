using Microsoft.Extensions.Options;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Models.DTO;
using ParliamentVotingApp.Options;
using System.Net.Http.Json;
namespace ParliamentVotingApp.Services;

public class PVBackendAPI : IPVBackendAPI
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly IOptions<ExternalAPIOptions> _options;

    public PVBackendAPI(HttpClient httpClient, IOptions<ExternalAPIOptions> options)
    {
        _httpClient = httpClient;
        _options = options;
        _baseUrl = _options.Value.BaseURL;
    }

    public async Task<TermInfoResponse?> GetCurrentTerm()
    {
        try
        {
            var terms = await _httpClient.GetFromJsonAsync<List<TermInfoResponse>>($"{_baseUrl}/term");
            if (terms == null)
                return null;
            terms.Sort((a, b) => b.From.CompareTo(a.From));
            return terms.FirstOrDefault(t => t.Current);
        }
        catch (Exception)
        {
            // Log the exception (not implemented here for brevity)
        }
        return null;
    }
}
