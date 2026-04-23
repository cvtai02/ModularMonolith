using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Categories;
using SharedKernel.DTOs;

namespace ProductCatalog.Core.Usecases.Categories;

public class ListCategories(ProductCatalogDbContext db)
{
    public async Task<PaginatedList<CategoryResponse>> ExecuteAsync(
        int pageNumber, int pageSize, string? search, CancellationToken ct)
    {
        var query = db.Categories.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(s) || x.Slug.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderBy(x => x.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new CategoryResponse
            {
                Name = x.Name,
                Description = x.Description,
                ImageUrl = x.ImageUrl,
                Status = x.Status,
                ParentName = x.Parent != null ? x.Parent.Name : null,
                Slug = x.Slug,
            })
            .ToListAsync(ct);

        return new PaginatedList<CategoryResponse>(items, totalCount, pageNumber, pageSize);
    }
}
