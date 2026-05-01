using Microsoft.EntityFrameworkCore;
using ProductCatalog.DTOs.Collections;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace ProductCatalog.Core.Usecases.Collections;

public class UpdateCollection(ProductCatalogDbContext db, IFileManager fm)
{
    public async Task<CollectionResponse?> ExecuteAsync(int id, UpdateCollectionRequest request, CancellationToken ct)
    {
        var collection = await db.Collections.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (collection is null) return null;

        var slug = request.Slug.Trim();
        if (!string.IsNullOrWhiteSpace(slug) && slug != collection.Slug &&
            await db.Collections.AnyAsync(x => x.Slug == slug && x.Id != id, ct))
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Slug)] = ["Slug already exists."]
            });

        collection.Description = request.Description.Trim();
        if (!string.IsNullOrWhiteSpace(slug)) collection.Slug = slug;
        collection.ImageKey = request.ImageKey?.Trim();

        await db.SaveChangesAsync(ct);
        return CollectionMapper.ToResponse(collection, fm);
    }
}
