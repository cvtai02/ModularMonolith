using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPostCollections;

public class DeleteBlogPostCollection(ContentDbContext db)
{
    public async Task<bool> ExecuteAsync(int id, CancellationToken ct)
    {
        var collection = await db.BlogPostCollections
            .ActiveOnly()
            .Include(x => x.Items.Where(i => !i.IsDeleted))
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (collection is null)
        {
            return false;
        }

        collection.IsDeleted = true;
        foreach (var item in collection.Items)
        {
            item.IsDeleted = true;
        }

        await db.SaveChangesAsync(ct);
        return true;
    }
}
