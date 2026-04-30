using Content.Core.DTOs.BlogPosts;
using Content.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPosts;

public class GetPublishedBlogPostBySlug(ContentDbContext db)
{
    public async Task<BlogPostResponse?> ExecuteAsync(string slug, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return null;
        }

        var normalizedSlug = slug.Trim().ToLowerInvariant();
        var post = await db.BlogPosts
            .AsNoTracking()
            .ActiveOnly()
            .Where(x => x.Status == BlogPostStatus.Published)
            .FirstOrDefaultAsync(x => x.Slug == normalizedSlug, ct);

        return post is null ? null : BlogPostMapper.ToResponse(post);
    }
}
