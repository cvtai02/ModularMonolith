using Microsoft.AspNetCore.Mvc;
using ProductCatalog.Core.Usecases.Products;
using ProductCatalog.DTOs.Products;
using SharedKernel.DTOs;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/customer/products")]
public class CustomerProductController(
    ListCustomerProducts listCustomerProducts,
    GetCustomerProductById getCustomerProductById) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<CustomerProductSummaryResponse>>> GetAll(
        [FromQuery] ListCustomerProductsRequest request,
        CancellationToken cancellationToken)
        => Ok(await listCustomerProducts.ExecuteAsync(request, cancellationToken));

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerProductResponse>> GetById(
        string id,
        CancellationToken cancellationToken)
    {
        var result = await getCustomerProductById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<CustomerProductResponse>> GetBySlug(
        string slug,
        CancellationToken cancellationToken)
    {
        var result = await getCustomerProductById.ExecuteBySlugAsync(slug, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
