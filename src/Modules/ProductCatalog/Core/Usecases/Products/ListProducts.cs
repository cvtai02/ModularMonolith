using Microsoft.EntityFrameworkCore;
using Inventory;
using ProductCatalog.DTOs.Products;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace ProductCatalog.Core.Usecases.Products;

public class ListProducts(ProductCatalogDbContext db, InventoryDbContext inventoryDb, IFileManager fileManager)
{
    public async Task<PaginatedList<ProductResponse>> ExecuteAsync(
        ListProductsRequest request, CancellationToken ct)
    {
        var query = db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.ShippingInfo)
            .Include(x => x.Medias)
            .Include(x => x.Options).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.ShippingInfo)
            .Include(x => x.Metric)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(search) ||
                x.Description.ToLower().Contains(search) ||
                x.Slug.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(request.CategoryName))
            query = query.Where(x => x.Category.Name == request.CategoryName.Trim());

        if (request.Status.HasValue)
            query = query.Where(x => x.Status == request.Status.Value);

        query = ApplySorting(query, request);

        var totalCount = await query.CountAsync(ct);
        var products = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        var productIds = products.Select(x => x.Id).ToList();
        var variantIds = products.SelectMany(x => x.Variants).Select(x => x.Id).ToList();

        var productInventories = await inventoryDb.ProductInventories
            .AsNoTracking()
            .Where(x => productIds.Contains(x.ProductId))
            .ToDictionaryAsync(x => x.ProductId, ct);

        var variantInventories = await inventoryDb.VariantInventories
            .AsNoTracking()
            .Include(x => x.Tracking)
            .Where(x => variantIds.Contains(x.VariantId))
            .ToDictionaryAsync(x => x.VariantId, ct);

        var items = products.Select(p =>
        {
            productInventories.TryGetValue(p.Id, out var productInventory);
            var productVariantInventories = p.Variants
                .Where(x => variantInventories.ContainsKey(x.Id))
                .ToDictionary(x => x.Id, x => variantInventories[x.Id]);
            return ProductMapper.ToResponse(p, fileManager, productInventory, productVariantInventories);
        }).ToList();
        return new PaginatedList<ProductResponse>(items, totalCount, request.PageNumber, request.PageSize);
    }

    private static IQueryable<Product> ApplySorting(IQueryable<Product> query, ListProductsRequest request)
    {
        var direction = request.SortDirection?.Trim().ToLowerInvariant();
        var descending = direction == "desc" || direction == "descending";
        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "price" => descending ? query.OrderByDescending(x => x.Price) : query.OrderBy(x => x.Price),
            "status" => descending ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
            "category" => descending ? query.OrderByDescending(x => x.Category.Name) : query.OrderBy(x => x.Category.Name),
            _ => descending ? query.OrderByDescending(x => x.LastModified) : query.OrderBy(x => x.Name)
        };
    }
}
