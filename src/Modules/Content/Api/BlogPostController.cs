using Content.Core.DTOs.BlogPosts;
using Content.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Extensions;
using SharedKernel.Exceptions;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/BlogPost")]
public class BlogPostController(ContentDbContext db) : ControllerBase
{
    private readonly ContentDbContext _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var blogPosts = await _db.BlogPosts
            .AsNoTracking()
            .OrderByDescending(x => x.LastModified)
            .ThenBy(x => x.Title)
            .ToListAsync(cancellationToken);

        return Ok(blogPosts.Select(MapToResponse));
    }

    [HttpGet("{title}")]
    public async Task<IActionResult> GetByTitle(string title, CancellationToken cancellationToken)
    {
        var blogPost = await _db.BlogPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Title == title, cancellationToken);

        return blogPost is null ? NotFound() : Ok(MapToResponse(blogPost));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBlogPostRequest request, CancellationToken cancellationToken)
    {
        var title = request.Title.Trim();
        var exists = await _db.BlogPosts.AnyAsync(x => x.Title == title, cancellationToken);
        if (exists)
        {
            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(request.Title)] = ["Blog post already exists."]
                });
        }

        var entity = new BlogPost
        {
            Title = title,
            Slug = string.IsNullOrWhiteSpace(request.Slug) ? title.ToSlug() : request.Slug.Trim(),
            Content = request.Content.Trim(),
            Summary = request.Summary.Trim(),
            ImageUrl = request.ImageUrl.Trim(),
            Status = request.Status
        };

        _db.BlogPosts.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetByTitle), new { title = entity.Title }, MapToResponse(entity));
    }

    [HttpPut("{title}")]
    public async Task<IActionResult> Update(string title, [FromBody] UpdateBlogPostRequest request, CancellationToken cancellationToken)
    {
        var blogPost = await _db.BlogPosts.FirstOrDefaultAsync(x => x.Title == title, cancellationToken);
        if (blogPost is null)
        {
            return NotFound();
        }

        blogPost.Slug = string.IsNullOrWhiteSpace(request.Slug) ? blogPost.Title.ToSlug() : request.Slug.Trim();
        blogPost.Content = request.Content.Trim();
        blogPost.Summary = request.Summary.Trim();
        blogPost.ImageUrl = request.ImageUrl.Trim();
        blogPost.Status = request.Status;

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(blogPost));
    }

    [HttpDelete("{title}")]
    public async Task<IActionResult> Delete(string title, CancellationToken cancellationToken)
    {
        var blogPost = await _db.BlogPosts.FirstOrDefaultAsync(x => x.Title == title, cancellationToken);
        if (blogPost is null)
        {
            return NotFound();
        }

        _db.BlogPosts.Remove(blogPost);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static BlogPostResponse MapToResponse(BlogPost blogPost)
    {
        return new BlogPostResponse
        {
            Title = blogPost.Title,
            Slug = blogPost.Slug,
            Content = blogPost.Content,
            Summary = blogPost.Summary,
            ImageUrl = blogPost.ImageUrl,
            Status = blogPost.Status
        };
    }
}
