namespace ParliamentVotingApp.Options;

public sealed class ExternalAPIOptions
{
    public static string SectionKey => "ExternalAPIOptions";
    public required string BaseURL { get; set; }
}
