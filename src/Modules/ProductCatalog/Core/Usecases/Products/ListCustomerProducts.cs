using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Products;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace ProductCatalog.Core.Usecases.Products;

[UsecaseInject]
public class ListCustomerProducts(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<PaginatedList<CustomerProductSummaryResponse>> ExecuteAsync(
        ListCustomerProductsRequest request,
        CancellationToken ct)
    {
        var query = db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Medias)
            .Include(x => x.Variants)
            .Include(x => x.Metric)
            .Where(x => x.Status == ProductStatus.Active && x.Category.Status == CategoryStatus.Active)
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

        query = ApplySorting(query, request);

        var totalCount = await query.CountAsync(ct);
        var products = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        var items = products.Select(p => CustomerProductMapper.ToSummary(p, fileManager)).ToList();
        return new PaginatedList<CustomerProductSummaryResponse>(items, totalCount, request.PageNumber, request.PageSize);
    }

    private static IQueryable<Product> ApplySorting(IQueryable<Product> query, ListCustomerProductsRequest request)
    {
        var direction = request.SortDirection?.Trim().ToLowerInvariant();
        var descending = direction == "desc" || direction == "descending";
        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "price" => descending ? query.OrderByDescending(x => x.Price) : query.OrderBy(x => x.Price),
            "category" => descending ? query.OrderByDescending(x => x.Category.Name) : query.OrderBy(x => x.Category.Name),
            _ => descending ? query.OrderByDescending(x => x.LastModified) : query.OrderBy(x => x.Name)
        };
    }
}
