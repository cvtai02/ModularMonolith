using Content.Core.Entities;
using Content.DTOs.BlogPostCollections;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPostCollections;

public class GetPublicBlogPostCollectionByKey(ContentDbContext db)
{
    public async Task<BlogPostCollectionResponse?> ExecuteAsync(string key, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return null;
        }

        var normalizedKey = BlogPostCollectionValidation.NormalizeKey(key);

        var collection = await db.BlogPostCollections
            .AsNoTracking()
            .ActiveOnly()
            .Include(x => x.Items.Where(i => !i.IsDeleted))
                .ThenInclude(x => x.BlogPost)
            .FirstOrDefaultAsync(x => x.Key == normalizedKey && x.IsPublic, ct);

        if (collection is null)
        {
            return null;
        }

        collection.Items = collection.Items
            .Where(x => !x.BlogPost.IsDeleted && x.BlogPost.Status == BlogPostStatus.Published)
            .OrderBy(x => x.DisplayOrder)
            .ToList();

        return BlogPostCollectionMapper.ToResponse(collection);
    }
}
