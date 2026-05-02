using Content.DTOs.BlogPostCollections;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPostCollections;

public class GetAdminBlogPostCollectionById(ContentDbContext db)
{
    public async Task<BlogPostCollectionResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var collection = await db.BlogPostCollections
            .AsNoTracking()
            .ActiveOnly()
            .Include(x => x.Items.Where(i => !i.IsDeleted))
                .ThenInclude(x => x.BlogPost)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return collection is null ? null : BlogPostCollectionMapper.ToResponse(collection);
    }
}
