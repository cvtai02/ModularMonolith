using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Products;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Products;

[UsecaseInject]
public class GetCustomerProductById(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<CustomerProductResponse?> ExecuteAsync(string id, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(id))
            return null;

        var normalizedId = id.Trim();
        var product = await BuildCustomerProductQuery()
            .FirstOrDefaultAsync(x => x.Id == normalizedId, ct);

        return product is null ? null : CustomerProductMapper.ToResponse(product, fileManager);
    }

    public async Task<CustomerProductResponse?> ExecuteBySlugAsync(string slug, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return null;

        var normalizedSlug = slug.Trim();
        var product = await BuildCustomerProductQuery()
            .FirstOrDefaultAsync(x => x.Slug == normalizedSlug, ct);

        return product is null ? null : CustomerProductMapper.ToResponse(product, fileManager);
    }

    private IQueryable<Product> BuildCustomerProductQuery() => db.Products
        .AsNoTracking()
        .Include(x => x.Category)
        .Include(x => x.Medias)
        .Include(x => x.Options).ThenInclude(x => x.OptionValues)
        .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
        .Include(x => x.Metric)
        .Where(x => x.Status == ProductStatus.Active && x.Category.Status == CategoryStatus.Active);
}
