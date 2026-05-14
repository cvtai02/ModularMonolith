using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Categories;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace ProductCatalog.Core.Usecases.Categories;

[UsecaseInject]
public class ListCustomerCategories(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<PaginatedList<CustomerCategoryResponse>> ExecuteAsync(
        int pageNumber,
        int pageSize,
        string? search,
        CancellationToken ct)
    {
        var query = db.Categories
            .AsNoTracking()
            .Include(x => x.Parent)
            .Where(x => x.Status == CategoryStatus.Active)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(s) || x.Slug.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync(ct);
        var categories = await query
            .OrderBy(x => x.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = categories.Select(x => CustomerCategoryMapper.ToResponse(x, fileManager)).ToList();
        return new PaginatedList<CustomerCategoryResponse>(items, totalCount, pageNumber, pageSize);
    }
}
