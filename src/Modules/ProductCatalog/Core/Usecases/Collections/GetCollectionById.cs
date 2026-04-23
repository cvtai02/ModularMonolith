using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Collections;

namespace ProductCatalog.Core.Usecases.Collections;

public class GetCollectionById(ProductCatalogDbContext db)
{
    public async Task<CollectionResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var collection = await db.Collections
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return collection is null ? null : CollectionMapper.ToResponse(collection);
    }
}
