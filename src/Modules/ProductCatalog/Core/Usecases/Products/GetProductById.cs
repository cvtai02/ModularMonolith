using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Products;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Products;

public class GetProductById(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<ProductResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var product = await db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Medias)
            .Include(x => x.Options).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.ShippingInfo)
            .Include(x => x.Metric)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return product is null ? null : ProductMapper.ToResponse(product, fileManager);
    }
}
