using Microsoft.AspNetCore.Mvc;
using ParliamentVotingApp.Contracts;
using ParliamentVotingApp.Models.DTO;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace ParliamentVotingApp.Controllers;

[ApiController]
[Route("api/")]
public class ParliamentVotingsController : ControllerBase
{
    private readonly ILogger<ParliamentVotingsController> _logger;
    private readonly IDatabaseManager _databaseManager;
    public ParliamentVotingsController(ILogger<ParliamentVotingsController> logger,
        IDatabaseManager databaseManager)
    {
        _logger = logger;
        _databaseManager = databaseManager;
    }

    [HttpGet("proceedings")]
    public async Task<IActionResult> GetAllProceedings()
    {
        var proceedings = await _databaseManager.GetAllProceedings();
        var filtred = proceedings.Select(p => new
        {
            p.ProceedingNumber,
            p.Title,
            p.Dates
        }).OrderByDescending(p=>p.ProceedingNumber);
        return Ok(filtred);
    }

    [HttpGet("votings/{proceedingNumber}")]
    public async Task<IActionResult> GetAllVotings(int proceedingNumber)
    {
        var proceedings = await _databaseManager.GetAllProceedings();
        if(proceedings==null)return NotFound();
        var votings = await _databaseManager.GetAllVotingsForProceeding(proceedingNumber);
        if (votings == null) return NotFound();
        var filtred = votings.Select(v => new
        {
            v.Date,
            v.Title,
            v.Description,
            v.Topic,
            v.VotingNumber,
            ProceedingNumber=proceedingNumber,
            v.Adopted,
            ShowAdopted = v.VotingOptions.Count==0,
        }).OrderBy(v=>v.VotingNumber);
        return Ok(filtred);
    }

    [HttpGet("details/{proceedingNumber}/{votingNumber}")] 
    public async Task<IActionResult> GetVotingDetails(int proceedingNumber, int votingNumber)
    {
        var voting = await _databaseManager.GetVotingDetails(proceedingNumber, votingNumber);
        if(voting == null) return NotFound();
        voting.Votes = voting.Votes.OrderBy(v => v.FirstName).ThenBy(v=>v.LastName).ToList();
        var filtred = new
        {
            voting.ProceedingNumber,
            voting.VotingNumber,
            voting.YesVotesCount,
            voting.NoVotesCount,
            voting.AbstainCount,
            voting.NotParticipatingCount,
            voting.Title,
            voting.Description,
            voting.Topic,
            voting.Date,
            voting.Adopted,
            voting.MajorityType,
            voting.MajorityVotes,
            voting.ClubVotes,
            voting.ClubListVotes,
            voting.VotingOptions,
            voting.Votes,
            voting.TotalVoted,
            voting.AdoptedList,
            PrintInfo =voting.PrintsInfo,

        };
        return Ok(filtred);
    }
}
