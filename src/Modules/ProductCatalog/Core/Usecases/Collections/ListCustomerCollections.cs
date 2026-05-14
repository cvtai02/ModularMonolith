using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Collections;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace ProductCatalog.Core.Usecases.Collections;

[UsecaseInject]
public class ListCustomerCollections(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<PaginatedList<CustomerCollectionResponse>> ExecuteAsync(
        int pageNumber,
        int pageSize,
        string? search,
        CancellationToken ct)
    {
        var query = db.Collections.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(s) || x.Slug.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync(ct);
        var collections = await query
            .OrderBy(x => x.Title)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var collectionIds = collections.Select(x => x.Id).ToList();
        var productCounts = await db.CollectionProducts
            .AsNoTracking()
            .Where(x =>
                collectionIds.Contains(x.CollectionId) &&
                x.Product.Status == ProductStatus.Active &&
                x.Product.Category.Status == CategoryStatus.Active)
            .GroupBy(x => x.CollectionId)
            .Select(x => new { CollectionId = x.Key, ProductCount = x.Select(cp => cp.ProductId).Distinct().Count() })
            .ToDictionaryAsync(x => x.CollectionId, x => x.ProductCount, ct);

        var items = collections
            .Select(x => CustomerCollectionMapper.ToResponse(
                x,
                fileManager,
                productCounts.GetValueOrDefault(x.Id)))
            .ToList();

        return new PaginatedList<CustomerCollectionResponse>(items, totalCount, pageNumber, pageSize);
    }
}
