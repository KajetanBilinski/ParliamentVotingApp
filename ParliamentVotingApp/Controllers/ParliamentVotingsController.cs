using Microsoft.AspNetCore.Mvc;
using ParliamentVotingApp.Contracts;
using System;
using System.Collections.Generic;
using System.Text;

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
            p.Title
        }); 
        return Ok(filtred);
    }
}
