using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Collections;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Collections;

[UsecaseInject]
public class GetCustomerCollectionById(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<CustomerCollectionDetailResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var collection = await db.Collections
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return collection is null ? null : await BuildResponseAsync(collection, ct);
    }

    public async Task<CustomerCollectionDetailResponse?> ExecuteBySlugAsync(string slug, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return null;

        var normalizedSlug = slug.Trim();
        var collection = await db.Collections
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Slug == normalizedSlug, ct);

        return collection is null ? null : await BuildResponseAsync(collection, ct);
    }

    private async Task<CustomerCollectionDetailResponse> BuildResponseAsync(Collection collection, CancellationToken ct)
    {
        var collectionProducts = await db.CollectionProducts
            .AsNoTracking()
            .Include(x => x.Product).ThenInclude(x => x.Category)
            .Include(x => x.Product).ThenInclude(x => x.Medias)
            .Include(x => x.Product).ThenInclude(x => x.Variants)
            .Include(x => x.Product).ThenInclude(x => x.Metric)
            .Where(x =>
                x.CollectionId == collection.Id &&
                x.Product.Status == ProductStatus.Active &&
                x.Product.Category.Status == CategoryStatus.Active)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(ct);

        return CustomerCollectionMapper.ToDetailResponse(collection, fileManager, collectionProducts);
    }
}
