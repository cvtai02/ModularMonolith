using Content.DTOs.BlogPosts;
using Content.Core.Usecases.BlogPosts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;
using SharedKernel.DTOs;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/blog-posts")]
public class BlogPostController(
    ListPublishedBlogPosts listPublishedBlogPosts,
    GetPublishedBlogPostBySlug getPublishedBlogPostBySlug,
    ListAdminBlogPosts listAdminBlogPosts,
    GetAdminBlogPostById getAdminBlogPostById,
    CreateBlogPost createBlogPost,
    UpdateBlogPost updateBlogPost,
    PublishBlogPost publishBlogPost,
    ArchiveBlogPost archiveBlogPost,
    DeleteBlogPost deleteBlogPost) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<BlogPostSummaryResponse>>> GetPublished(
        [FromQuery] ListBlogPostsRequest request,
        CancellationToken cancellationToken)
        => Ok(await listPublishedBlogPosts.ExecuteAsync(request, cancellationToken));

    [HttpGet("{slug}")]
    public async Task<ActionResult<BlogPostResponse>> GetBySlug(
        string slug,
        CancellationToken cancellationToken)
    {
        var result = await getPublishedBlogPostBySlug.ExecuteAsync(slug, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet("admin")]
    public async Task<ActionResult<PaginatedList<BlogPostSummaryResponse>>> GetAdmin(
        [FromQuery] ListAdminBlogPostsRequest request,
        CancellationToken cancellationToken)
        => Ok(await listAdminBlogPosts.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet("admin/{id:int}")]
    public async Task<ActionResult<BlogPostResponse>> GetAdminById(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await getAdminBlogPostById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost]
    public async Task<ActionResult<BlogPostResponse>> Create(
        [FromBody] CreateBlogPostRequest request,
        CancellationToken cancellationToken)
    {
        var result = await createBlogPost.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetAdminById), new { id = result.Id }, result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<BlogPostResponse>> Update(
        int id,
        [FromBody] UpdateBlogPostRequest request,
        CancellationToken cancellationToken)
    {
        var result = await updateBlogPost.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost("{id:int}/publish")]
    public async Task<ActionResult<BlogPostResponse>> Publish(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await publishBlogPost.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost("{id:int}/archive")]
    public async Task<ActionResult<BlogPostResponse>> Archive(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await archiveBlogPost.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var deleted = await deleteBlogPost.ExecuteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
