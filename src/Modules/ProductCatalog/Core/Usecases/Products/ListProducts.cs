using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Products;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace ProductCatalog.Core.Usecases.Products;

public class ListProducts(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<PaginatedList<ProductResponse>> ExecuteAsync(
        ListProductsRequest request, CancellationToken ct)
    {
        var query = db.Products
            .AsNoTracking()
            .Include(x => x.Category)
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

        var items = products.Select(p => ProductMapper.ToResponse(p, fileManager)).ToList();
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
