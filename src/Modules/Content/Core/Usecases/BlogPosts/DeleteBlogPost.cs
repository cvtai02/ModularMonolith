using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPosts;

public class DeleteBlogPost(ContentDbContext db)
{
    public async Task<bool> ExecuteAsync(int id, CancellationToken ct)
    {
        var post = await db.BlogPosts
            .ActiveOnly()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (post is null)
        {
            return false;
        }

        post.IsDeleted = true;
        await db.SaveChangesAsync(ct);
        return true;
    }
}
