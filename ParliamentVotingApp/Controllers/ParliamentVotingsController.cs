using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;

namespace ParliamentVotingApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParliamentVotingsController : ControllerBase
{
    private readonly ILogger<ParliamentVotingsController> _logger;
    public ParliamentVotingsController(ILogger<ParliamentVotingsController> logger)
    {
        _logger = logger;
    }

    [HttpGet("/proceedings")]
    public async Task<IActionResult> GetAllProceedings()
    {
        return Ok();
    }
}
