using System.Security.Claims;
using Account.DTOs.AccountAddresses;
using Account.Core.Entities;
using Account.Core.Usecases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;

namespace Account.Api;

[ApiController]
[Authorize]
[Route($"api/{ModuleConstants.Key}/addresses")]
public class AccountAddressController(
    ListMyAccountAddresses listMyAccountAddresses,
    CreateMyAccountAddress createMyAccountAddress,
    UpdateMyAccountAddress updateMyAccountAddress,
    DeleteMyAccountAddress deleteMyAccountAddress) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AccountAddressResponse>>> GetAll(CancellationToken cancellationToken)
        => Ok(await listMyAccountAddresses.ExecuteAsync(ResolveAccountType(User), cancellationToken));

    [HttpPost]
    public async Task<ActionResult<AccountAddressResponse>> Create(
        [FromBody] SaveAccountAddressRequest request,
        CancellationToken cancellationToken)
        => Ok(await createMyAccountAddress.ExecuteAsync(request, ResolveAccountType(User), cancellationToken));

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AccountAddressResponse>> Update(
        int id,
        [FromBody] SaveAccountAddressRequest request,
        CancellationToken cancellationToken)
    {
        var result = await updateMyAccountAddress.ExecuteAsync(id, request, ResolveAccountType(User), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var deleted = await deleteMyAccountAddress.ExecuteAsync(id, ResolveAccountType(User), cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private static AccountType ResolveAccountType(ClaimsPrincipal user)
    {
        if (user.IsInRole(Roles.TenantAdmin))
            return AccountType.TenantAdmin;

        if (user.IsInRole(Roles.TenantModerator))
            return AccountType.TenantStaff;

        return AccountType.Customer;
    }
}
