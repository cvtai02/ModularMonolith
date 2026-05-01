using Microsoft.AspNetCore.Mvc;
using ProductCatalog.DTOs.Products;
using ProductCatalog.Core.Usecases.Products;
using SharedKernel.DTOs;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/products")]
public class ProductController(
    ListProducts listProducts,
    GetProductById getProductById,
    CreateProduct createProduct,
    UpdateProduct updateProduct) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<ProductResponse>>> GetAll(
        [FromQuery] ListProductsRequest request, CancellationToken cancellationToken)
        => Ok(await listProducts.ExecuteAsync(request, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await getProductById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponse>> Create(
        [FromBody] CreateProductRequest request, CancellationToken cancellationToken)
    {
        var result = await createProduct.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponse>> Update(
        int id, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var result = await updateProduct.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
