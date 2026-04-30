using Content.Core.DTOs.BlogPosts;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPosts;

public class GetAdminBlogPostById(ContentDbContext db)
{
    public async Task<BlogPostResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var post = await db.BlogPosts
            .AsNoTracking()
            .ActiveOnly()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return post is null ? null : BlogPostMapper.ToResponse(post);
    }
}
