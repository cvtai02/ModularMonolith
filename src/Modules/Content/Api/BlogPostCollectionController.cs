using Content.Core.Usecases.BlogPostCollections;
using Content.DTOs.BlogPostCollections;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;
using SharedKernel.DTOs;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/blog-post-collections")]
public class BlogPostCollectionController(
    GetPublicBlogPostCollectionByKey getPublicBlogPostCollectionByKey,
    ListAdminBlogPostCollections listAdminBlogPostCollections,
    ListAdminBlogPostsByCollection listAdminBlogPostsByCollection,
    GetAdminBlogPostCollectionById getAdminBlogPostCollectionById,
    CreateBlogPostCollection createBlogPostCollection,
    UpdateBlogPostCollection updateBlogPostCollection,
    DeleteBlogPostCollection deleteBlogPostCollection) : ControllerBase
{
    [HttpGet("{key}")]
    public async Task<ActionResult<BlogPostCollectionResponse>> GetPublicByKey(
        string key,
        CancellationToken cancellationToken)
    {
        var result = await getPublicBlogPostCollectionByKey.ExecuteAsync(key, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet("admin")]
    public async Task<ActionResult<PaginatedList<BlogPostCollectionSummaryResponse>>> GetAdmin(
        [FromQuery] ListBlogPostCollectionsRequest request,
        CancellationToken cancellationToken)
        => Ok(await listAdminBlogPostCollections.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet("admin/blog-posts")]
    public async Task<ActionResult<PaginatedList<AdminBlogPostCollectionGroupResponse>>> GetAdminBlogPostsByCollection(
        [FromQuery] ListAdminBlogPostsByCollectionRequest request,
        CancellationToken cancellationToken)
        => Ok(await listAdminBlogPostsByCollection.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet("admin/{id:int}")]
    public async Task<ActionResult<BlogPostCollectionResponse>> GetAdminById(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await getAdminBlogPostCollectionById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost]
    public async Task<ActionResult<BlogPostCollectionResponse>> Create(
        [FromBody] CreateBlogPostCollectionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await createBlogPostCollection.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetAdminById), new { id = result.Id }, result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<BlogPostCollectionResponse>> Update(
        int id,
        [FromBody] UpdateBlogPostCollectionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await updateBlogPostCollection.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var deleted = await deleteBlogPostCollection.ExecuteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
