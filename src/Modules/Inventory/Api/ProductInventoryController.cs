using Inventory.DTOs.Inventory;
using Inventory.Core.Usecases.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;

namespace Inventory.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}")]
public class ProductInventoryController(
    InitializeProductInventory initializeProductInventory,
    ImportVariantInventory importVariantInventory) : ControllerBase
{
    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost("products/{productId}/initialize")]
    public async Task<ActionResult<InitializeProductInventoryResponse>> Initialize(
        string productId,
        [FromBody] InitializeProductInventoryRequest request,
        CancellationToken cancellationToken)
        => Ok(await initializeProductInventory.ExecuteAsync(productId, request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost("variants/import")]
    public async Task<ActionResult<ImportVariantInventoryResponse>> ImportVariants(
        [FromBody] ImportVariantInventoryRequest request,
        CancellationToken cancellationToken)
        => Ok(await importVariantInventory.ExecuteAsync(request, cancellationToken));
}
