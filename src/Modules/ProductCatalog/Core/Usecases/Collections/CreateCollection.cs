using Microsoft.EntityFrameworkCore;
using ProductCatalog.DTOs.Collections;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.Usecases.Collections;

public class CreateCollection(ProductCatalogDbContext db, IFileManager fm)
{
    public async Task<CollectionResponse> ExecuteAsync(CreateCollectionRequest request, CancellationToken ct)
    {
        request.ProductIds ??= [];
        var title = request.Title.Trim();
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? title.ToSlug() : request.Slug.Trim();
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(title))
            errors[nameof(request.Title)] = ["Collection title is required."];

        if (await db.Collections.AnyAsync(x => x.Slug == slug, ct))
            errors[nameof(request.Slug)] = ["Slug already exists."];

        var productIdErrors = new List<string>();
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

        var collection = new Collection
        {
            Title = title,
            Description = request.Description.Trim(),
            Slug = slug,
            ImageKey = request.ImageKey?.Trim(),
        };

        db.Collections.Add(collection);
        db.CollectionProducts.AddRange(productIds.Select((productId, index) => new CollectionProduct
        {
            Collection = collection,
            ProductId = productId,
            DisplayOrder = index
        }));
        await db.SaveChangesAsync(ct);

        return CollectionMapper.ToResponse(collection, fm, productIds.Count);
    }
}
