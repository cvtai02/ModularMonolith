using Content.Core.DTOs.BlogPosts;
using Content.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPosts;

public class PublishBlogPost(ContentDbContext db)
{
    public async Task<BlogPostResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var post = await db.BlogPosts
            .ActiveOnly()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (post is null)
        {
            return null;
        }

        post.Status = BlogPostStatus.Published;
        post.PublishedAt ??= DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);
        return BlogPostMapper.ToResponse(post);
    }
}
