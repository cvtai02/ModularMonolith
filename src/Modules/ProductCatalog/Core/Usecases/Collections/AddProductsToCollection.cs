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

        var currentProducts = await db.CollectionProducts
            .Where(x => x.CollectionId == id)
            .ToListAsync(ct);
        var duplicateCurrentProducts = currentProducts
            .GroupBy(x => x.ProductId)
            .SelectMany(x => x.OrderBy(cp => cp.DisplayOrder).Skip(1))
            .ToList();
        if (duplicateCurrentProducts.Count > 0)
            db.CollectionProducts.RemoveRange(duplicateCurrentProducts);

        var currentProductIds = currentProducts
            .GroupBy(x => x.ProductId)
            .Select(x => x.Key)
            .ToList();
        var newProductIds = productIds.Except(currentProductIds).ToList();
        if (newProductIds.Count == 0)
        {
            if (duplicateCurrentProducts.Count > 0)
                await db.SaveChangesAsync(ct);

            return CollectionMapper.ToResponse(collection, fm, currentProductIds.Count);
        }

        var nextDisplayOrder = currentProducts
            .Except(duplicateCurrentProducts)
            .Select(x => (int?)x.DisplayOrder)
            .Max() ?? -1;

        db.CollectionProducts.AddRange(newProductIds.Select((productId, index) => new CollectionProduct
        {
            CollectionId = id,
            ProductId = productId,
            DisplayOrder = nextDisplayOrder + index + 1
        }));

        await db.SaveChangesAsync(ct);
        return CollectionMapper.ToResponse(collection, fm, currentProductIds.Count + newProductIds.Count);
    }
}
