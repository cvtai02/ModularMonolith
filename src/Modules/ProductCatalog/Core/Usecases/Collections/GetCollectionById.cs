using Microsoft.EntityFrameworkCore;
using ProductCatalog.DTOs.Collections;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Collections;

public class GetCollectionById(ProductCatalogDbContext db, IFileManager fm)
{
    public async Task<CollectionDetailResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var collection = await db.Collections
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (collection is null) return null;

        var collectionProducts = await db.CollectionProducts
            .AsNoTracking()
            .Include(x => x.Product).ThenInclude(x => x.Medias)
            .Include(x => x.Product).ThenInclude(x => x.Variants)
            .Where(x => x.CollectionId == id)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(ct);

        return CollectionMapper.ToDetailResponse(collection, fm, collectionProducts);
    }
}
