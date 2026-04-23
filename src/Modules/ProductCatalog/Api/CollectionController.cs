using Microsoft.AspNetCore.Mvc;
using ProductCatalog.Core.DTOs.Collections;
using ProductCatalog.Core.Usecases.Collections;
using SharedKernel.DTOs;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/collections")]
public class CollectionController(
    ListCollections listCollections,
    GetCollectionById getCollectionById,
    CreateCollection createCollection,
    UpdateCollection updateCollection,
    DeleteCollection deleteCollection) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<CollectionResponse>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
        => Ok(await listCollections.ExecuteAsync(pageNumber, pageSize, search, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CollectionResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await getCollectionById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CollectionResponse>> Create(
        [FromBody] CreateCollectionRequest request, CancellationToken cancellationToken)
    {
        var result = await createCollection.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CollectionResponse>> Update(
        int id, [FromBody] UpdateCollectionRequest request, CancellationToken cancellationToken)
    {
        var result = await updateCollection.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await deleteCollection.ExecuteAsync(id, cancellationToken);
        return result ? NoContent() : NotFound();
    }
}
