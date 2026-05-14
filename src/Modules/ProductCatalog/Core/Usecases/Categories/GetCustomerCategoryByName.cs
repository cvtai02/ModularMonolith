using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Categories;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Categories;

[UsecaseInject]
public class GetCustomerCategoryByName(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<CustomerCategoryResponse?> ExecuteAsync(string name, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(name))
            return null;

        var normalizedName = name.Trim();
        var category = await BuildCustomerCategoryQuery()
            .FirstOrDefaultAsync(x => x.Name == normalizedName, ct);

        return category is null ? null : CustomerCategoryMapper.ToResponse(category, fileManager);
    }

    public async Task<CustomerCategoryResponse?> ExecuteBySlugAsync(string slug, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return null;

        var normalizedSlug = slug.Trim();
        var category = await BuildCustomerCategoryQuery()
            .FirstOrDefaultAsync(x => x.Slug == normalizedSlug, ct);

        return category is null ? null : CustomerCategoryMapper.ToResponse(category, fileManager);
    }

    private IQueryable<Category> BuildCustomerCategoryQuery()
        => db.Categories
            .AsNoTracking()
            .Include(x => x.Parent)
            .Where(x => x.Status == CategoryStatus.Active);
}
