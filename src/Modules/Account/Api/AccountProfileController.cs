using System.Security.Claims;
using Account.Core.DTOs.AccountProfiles;
using Account.Core.Entities;
using Account.Core.Usecases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;
using SharedKernel.DTOs;

namespace Account.Api;

[ApiController]
[Authorize]
[Route($"api/{ModuleConstants.Key}/profile")]
public class AccountProfileController(
    GetMyAccountProfile getMyAccountProfile,
    UpdateMyAccountProfile updateMyAccountProfile) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AccountProfileResponse>> GetMe(CancellationToken cancellationToken)
        => Ok(await getMyAccountProfile.ExecuteAsync(ResolveAccountType(User), cancellationToken));

    [HttpPut]
    public async Task<ActionResult<AccountProfileResponse>> UpdateMe(
        [FromBody] UpdateAccountProfileRequest request,
        CancellationToken cancellationToken)
        => Ok(await updateMyAccountProfile.ExecuteAsync(request, ResolveAccountType(User), cancellationToken));

    private static AccountType ResolveAccountType(ClaimsPrincipal user)
    {
        if (user.IsInRole(Roles.TenantAdmin))
            return AccountType.TenantAdmin;

        if (user.IsInRole(Roles.TenantModerator))
            return AccountType.TenantStaff;

        return AccountType.Customer;
    }
}

[ApiController]
[Authorize(Policy = Policies.TenantAdminUp)]
[Route($"api/{ModuleConstants.Key}/admin/profiles")]
public class AdminAccountProfileController(
    ListAdminAccountProfiles listAdminAccountProfiles,
    GetAdminAccountProfileById getAdminAccountProfileById,
    UpdateAdminAccountProfile updateAdminAccountProfile) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<AccountProfileResponse>>> GetAll(
        [FromQuery] ListAccountProfilesRequest request,
        CancellationToken cancellationToken)
        => Ok(await listAdminAccountProfiles.ExecuteAsync(request, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AccountProfileResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await getAdminAccountProfileById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AccountProfileResponse>> Update(
        int id,
        [FromBody] AdminUpdateAccountProfileRequest request,
        CancellationToken cancellationToken)
    {
        var result = await updateAdminAccountProfile.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
