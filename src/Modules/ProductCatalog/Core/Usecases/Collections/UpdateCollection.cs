using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Collections;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace ProductCatalog.Core.Usecases.Collections;

public class UpdateCollection(ProductCatalogDbContext db, IFileManager fm)
{
    public async Task<CollectionResponse?> ExecuteAsync(int id, UpdateCollectionRequest request, CancellationToken ct)
    {
        request ??= new UpdateCollectionRequest();
        var collection = await db.Collections.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (collection is null) return null;

        var title = request.Title?.Trim();
        var slug = request.Slug?.Trim() ?? string.Empty;
        var errors = new Dictionary<string, string[]>();

        if (request.Title is not null && string.IsNullOrWhiteSpace(title))
            errors[nameof(request.Title)] = ["Collection title is required."];

        if (!string.IsNullOrWhiteSpace(slug) && slug != collection.Slug &&
            await db.Collections.AnyAsync(x => x.Slug == slug && x.Id != id, ct))
            errors[nameof(request.Slug)] = ["Slug already exists."];

        var productIds = request.ProductIds is null
            ? null
            : await ValidateProductIdsAsync(request.ProductIds, errors, ct);
        var productCount = productIds?.Count;

        if (errors.Count > 0) throw new ValidationException("Validation failed", errors);

        collection.Description = request.Description?.Trim() ?? string.Empty;
        if (title is not null) collection.Title = title;
        if (!string.IsNullOrWhiteSpace(slug)) collection.Slug = slug;
        collection.ImageKey = request.ImageKey?.Trim();

        if (productIds is not null)
        {
            var currentProducts = await db.CollectionProducts
                .Where(x => x.CollectionId == id)
                .ToListAsync(ct);
            SyncCollectionProducts(id, productIds, currentProducts);
        }

        await db.SaveChangesAsync(ct);
        productCount ??= await db.CollectionProducts
            .Where(x => x.CollectionId == id)
            .Select(x => x.ProductId)
            .Distinct()
            .CountAsync(ct);
        return CollectionMapper.ToResponse(collection, fm, productCount.Value);
    }

    private void SyncCollectionProducts(
        int collectionId,
        List<int> requestedProductIds,
        List<CollectionProduct> currentProducts)
    {
        var canonicalCurrentProducts = currentProducts
            .GroupBy(x => x.ProductId)
            .ToDictionary(
                x => x.Key,
                x => x.OrderBy(cp => cp.DisplayOrder).First());
        var duplicateCurrentProducts = currentProducts
            .Where(x => !ReferenceEquals(x, canonicalCurrentProducts[x.ProductId]))
            .ToList();
        if (duplicateCurrentProducts.Count > 0)
            db.CollectionProducts.RemoveRange(duplicateCurrentProducts);

        var requestedProductIdSet = requestedProductIds.ToHashSet();
        var removedProducts = canonicalCurrentProducts.Values
            .Where(x => !requestedProductIdSet.Contains(x.ProductId))
            .ToList();
        if (removedProducts.Count > 0)
            db.CollectionProducts.RemoveRange(removedProducts);

        for (var index = 0; index < requestedProductIds.Count; index++)
        {
            var productId = requestedProductIds[index];
            if (canonicalCurrentProducts.TryGetValue(productId, out var existingProduct))
            {
                existingProduct.DisplayOrder = index;
                continue;
            }

            db.CollectionProducts.Add(new CollectionProduct
            {
                CollectionId = collectionId,
                ProductId = productId,
                DisplayOrder = index
            });
        }
    }

    private async Task<List<int>> ValidateProductIdsAsync(
        List<int> requestedProductIds,
        Dictionary<string, string[]> errors,
        CancellationToken ct)
    {
        var productIdErrors = new List<string>();
        var productIds = requestedProductIds
            .Where(x => x > 0)
            .Distinct()
            .ToList();
        var invalidProductIds = requestedProductIds
            .Where(x => x <= 0)
            .Distinct()
            .ToList();
        if (invalidProductIds.Count > 0)
            productIdErrors.Add($"Product ids must be greater than zero: {string.Join(", ", invalidProductIds)}.");

        var existingProductIds = productIds.Count == 0
            ? new List<int>()
            : await db.Products
                .Where(x => productIds.Contains(x.Id))
                .Select(x => x.Id)
                .ToListAsync(ct);
        var missingProductIds = productIds.Except(existingProductIds).ToList();
        if (missingProductIds.Count > 0)
            productIdErrors.Add($"Product ids do not exist: {string.Join(", ", missingProductIds)}.");

        if (productIdErrors.Count > 0)
            errors[nameof(UpdateCollectionRequest.ProductIds)] = productIdErrors.ToArray();

        return productIds;
    }
}
