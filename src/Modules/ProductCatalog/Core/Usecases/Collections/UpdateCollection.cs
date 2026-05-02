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

        var slug = request.Slug?.Trim() ?? string.Empty;
        var errors = new Dictionary<string, string[]>();
        if (!string.IsNullOrWhiteSpace(slug) && slug != collection.Slug &&
            await db.Collections.AnyAsync(x => x.Slug == slug && x.Id != id, ct))
            errors[nameof(request.Slug)] = ["Slug already exists."];

        var productIds = request.ProductIds is null
            ? null
            : await ValidateProductIdsAsync(request.ProductIds, errors, ct);

        if (errors.Count > 0) throw new ValidationException("Validation failed", errors);

        collection.Description = request.Description?.Trim() ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(slug)) collection.Slug = slug;
        collection.ImageKey = request.ImageKey?.Trim();

        if (productIds is not null)
        {
            var currentProducts = await db.CollectionProducts
                .Where(x => x.CollectionId == id)
                .ToListAsync(ct);
            db.CollectionProducts.RemoveRange(currentProducts);
            db.CollectionProducts.AddRange(productIds.Select((productId, index) => new CollectionProduct
            {
                CollectionId = id,
                ProductId = productId,
                DisplayOrder = index
            }));
        }

        await db.SaveChangesAsync(ct);
        return CollectionMapper.ToResponse(collection, fm);
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
