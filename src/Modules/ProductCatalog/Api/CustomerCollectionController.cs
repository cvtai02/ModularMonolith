using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using ProductCatalog.Core.Usecases.Collections;
using ProductCatalog.DTOs.Collections;
using SharedKernel.DTOs;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/customer/collections")]
public class CustomerCollectionController(
    ListCustomerCollections listCustomerCollections,
    GetCustomerCollectionById getCustomerCollectionById) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<CustomerCollectionResponse>>> GetAll(
        [Range(1, int.MaxValue)]
        [FromQuery] int pageNumber = 1,
        [Range(1, 200)]
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
        => Ok(await listCustomerCollections.ExecuteAsync(pageNumber, pageSize, search, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerCollectionDetailResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await getCustomerCollectionById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<CustomerCollectionDetailResponse>> GetBySlug(
        string slug,
        CancellationToken cancellationToken)
    {
        var result = await getCustomerCollectionById.ExecuteBySlugAsync(slug, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
