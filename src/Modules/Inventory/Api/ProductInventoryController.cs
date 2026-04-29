using Inventory.Core.DTOs.Inventory;
using Inventory.Core.Usecases.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/products")]
public class ProductInventoryController(InitializeProductInventory initializeProductInventory) : ControllerBase
{
    [HttpPost("{productId:int}/initialize")]
    public async Task<ActionResult<InitializeProductInventoryResponse>> Initialize(
        int productId,
        [FromBody] InitializeProductInventoryRequest request,
        CancellationToken cancellationToken)
        => Ok(await initializeProductInventory.ExecuteAsync(productId, request, cancellationToken));
}
