using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using ProductCatalog.Core.Usecases.Categories;
using ProductCatalog.DTOs.Categories;
using SharedKernel.DTOs;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/customer/categories")]
public class CustomerCategoryController(
    ListCustomerCategories listCustomerCategories,
    GetCustomerCategoryByName getCustomerCategoryByName) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<CustomerCategoryResponse>>> GetAll(
        [Range(1, int.MaxValue)]
        [FromQuery] int pageNumber = 1,
        [Range(1, 200)]
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
        => Ok(await listCustomerCategories.ExecuteAsync(pageNumber, pageSize, search, cancellationToken));

    [HttpGet("{name}")]
    public async Task<ActionResult<CustomerCategoryResponse>> GetByName(
        string name,
        CancellationToken cancellationToken)
    {
        var result = await getCustomerCategoryByName.ExecuteAsync(name, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<CustomerCategoryResponse>> GetBySlug(
        string slug,
        CancellationToken cancellationToken)
    {
        var result = await getCustomerCategoryByName.ExecuteBySlugAsync(slug, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
