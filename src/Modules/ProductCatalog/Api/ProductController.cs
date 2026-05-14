using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ProductCatalog.DTOs.Products;
using ProductCatalog.Core.Usecases.Products;
using SharedKernel.Authorization;
using SharedKernel.DTOs;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/products")]
public class ProductController(
    ListProducts listProducts,
    GetProductById getProductById,
    CreateProduct createProduct,
    UpdateProduct updateProduct,
    DeleteProduct deleteProduct) : ControllerBase
{
    [Authorize(Policy = Policies.TenantModeratorUp)]
    [HttpGet]
    public async Task<ActionResult<PaginatedList<ProductSummaryResponse>>> GetAll(
        [FromQuery] ListProductsRequest request, CancellationToken cancellationToken)
        => Ok(await listProducts.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantModeratorUp)]
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponse>> GetById(string id, CancellationToken cancellationToken)
    {
        var result = await getProductById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost]
    public async Task<ActionResult<ProductResponse>> Create(
        [FromBody] CreateProductRequest request, CancellationToken cancellationToken)
    {
        var result = await createProduct.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPut("{id}")]
    public async Task<ActionResult<ProductResponse>> Update(
        string id, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var result = await updateProduct.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var result = await deleteProduct.ExecuteAsync(id, cancellationToken);
        return result ? NoContent() : NotFound();
    }
}
