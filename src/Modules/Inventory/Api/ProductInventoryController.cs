using Inventory.DTOs.Inventory;
using Inventory.Core.Usecases.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}")]
public class ProductInventoryController(
    InitializeProductInventory initializeProductInventory,
    ImportVariantInventory importVariantInventory) : ControllerBase
{
    [HttpPost("products/{productId:int}/initialize")]
    public async Task<ActionResult<InitializeProductInventoryResponse>> Initialize(
        int productId,
        [FromBody] InitializeProductInventoryRequest request,
        CancellationToken cancellationToken)
        => Ok(await initializeProductInventory.ExecuteAsync(productId, request, cancellationToken));

    [HttpPost("variants/import")]
    public async Task<ActionResult<ImportVariantInventoryResponse>> ImportVariants(
        [FromBody] ImportVariantInventoryRequest request,
        CancellationToken cancellationToken)
        => Ok(await importVariantInventory.ExecuteAsync(request, cancellationToken));
}
