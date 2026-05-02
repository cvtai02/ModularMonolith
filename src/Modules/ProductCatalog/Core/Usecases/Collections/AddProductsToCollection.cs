using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Collections;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace ProductCatalog.Core.Usecases.Collections;

public class AddProductsToCollection(ProductCatalogDbContext db, IFileManager fm)
{
    public async Task<CollectionResponse?> ExecuteAsync(int id, AddCollectionProductsRequest request, CancellationToken ct)
    {
        request ??= new AddCollectionProductsRequest();
        var collection = await db.Collections.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (collection is null) return null;

        request.ProductIds ??= [];
        var errors = new Dictionary<string, string[]>();
        var productIdErrors = new List<string>();
        if (request.ProductIds.Count == 0)
            productIdErrors.Add("At least one product id is required.");

        var productIds = request.ProductIds
            .Where(x => x > 0)
            .Distinct()
            .ToList();
        var invalidProductIds = request.ProductIds
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
            errors[nameof(request.ProductIds)] = productIdErrors.ToArray();

        if (errors.Count > 0) throw new ValidationException("Validation failed", errors);

        var currentProductIds = await db.CollectionProducts
            .Where(x => x.CollectionId == id)
            .Select(x => x.ProductId)
            .ToListAsync(ct);
        var newProductIds = productIds.Except(currentProductIds).ToList();
        if (newProductIds.Count == 0)
            return CollectionMapper.ToResponse(collection, fm);

        var nextDisplayOrder = await db.CollectionProducts
            .Where(x => x.CollectionId == id)
            .Select(x => (int?)x.DisplayOrder)
            .MaxAsync(ct) ?? -1;

        db.CollectionProducts.AddRange(newProductIds.Select((productId, index) => new CollectionProduct
        {
            CollectionId = id,
            ProductId = productId,
            DisplayOrder = nextDisplayOrder + index + 1
        }));

        await db.SaveChangesAsync(ct);
        return CollectionMapper.ToResponse(collection, fm);
    }
}
