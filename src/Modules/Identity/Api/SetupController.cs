using Identity.Core.DatabaseContext;
using Identity.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using SharedKernel.Authorization;

namespace Identity.Api;

[ApiController]
[Route("api/setup")]
public class AASeedController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ModuleDbContext _dbContext;

    public AASeedController(ModuleDbContext dbContext, UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _dbContext = dbContext;
    }

    /// <summary>
    /// Creates the one system admin account. Safe to call once — idempotent.
    /// If cannot create admin account, check db. 'cause this endpoint only accept 1 admin account
    /// </summary>[HttpPost("seed-admin")]
    [AllowAnonymous]
    [HttpPost("seed-admin")]
    public async Task<IActionResult> SeedAdmin([FromBody] AdminAccountInput input)
    {
        await using var tx = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var existingAdmins = await _userManager.GetUsersInRoleAsync(Roles.SystemAdmin);
            if (existingAdmins.Count > 0)
                return Conflict(new { message = "A system admin account already exists." });

            var email    = input.Email;
            var password = input.Password;

            var admin = new AppUser
            {
                UserName       = email,
                Email          = email,
                EmailConfirmed = true,
                DisplayName    = "System Administrator",
            };

            var result = await _userManager.CreateAsync(admin, password);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            // ensure role exists
            if (!await _roleManager.RoleExistsAsync(Roles.SystemAdmin))
            {
                var roleResult = await _roleManager.CreateAsync(new IdentityRole(Roles.SystemAdmin));
                if (!roleResult.Succeeded)
                    throw new Exception("Failed to create role");
            }

            var addRoleResult = await _userManager.AddToRoleAsync(admin, Roles.SystemAdmin);
            if (!addRoleResult.Succeeded)
                throw new Exception("Failed to assign role");

            await tx.CommitAsync();

            return Ok(new { message = "System admin created.", email });
        }
        catch
        {
            await tx.RollbackAsync();
            throw; // let middleware handle
        }
    }


    /// <summary>
    /// Idempotent — creates missing roles and syncs their claims.
    /// </summary>
    [HttpPost("seed-roles")]
    [Authorize(Roles = Roles.SystemAdmin)]
    public async Task<IActionResult> SeedRoles()
    {
        var results = new List<RoleSeedResult>();

        foreach (var (roleName, desiredClaims) in Roles.Claims)
        {
            var result = new RoleSeedResult { Role = roleName };

            // 1. Create role if missing
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                var created = await _roleManager.CreateAsync(new IdentityRole(roleName));
                if (!created.Succeeded)
                {
                    result.Status = "Failed";
                    result.Errors = created.Errors.Select(e => e.Description).ToList();
                    results.Add(result);
                    continue;
                }
                result.Status = "Created";
            }
            else
            {
                result.Status = "Exists";
            }

            // 2. Sync claims — add missing, skip duplicates
            var role          = await _roleManager.FindByNameAsync(roleName);
            var existingClaims = await _roleManager.GetClaimsAsync(role!);

            foreach (var claim in desiredClaims)
            {
                var exists = existingClaims.Any(c => c.Type == claim.Type && c.Value == claim.Value);
                if (!exists)
                {
                    await _roleManager.AddClaimAsync(role!, claim);
                    result.ClaimsAdded.Add($"{claim.Type}:{claim.Value}");
                }
            }

            results.Add(result);
        }

        return Ok(results);
    }
}


public class RoleSeedResult
{
    public string       Role        { get; set; } = "";
    public string       Status      { get; set; } = "";
    public List<string> ClaimsAdded { get; set; } = [];
    public List<string> Errors      { get; set; } = [];
}

public class AdminAccountInput {
    public string Email {get;set;} = "";
    public string Password {get;set;} ="";
}