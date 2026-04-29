using Microsoft.EntityFrameworkCore;
using Inventory;
using ProductCatalog.Core.DTOs.Products;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Products;

public class GetProductById(ProductCatalogDbContext db, InventoryDbContext inventoryDb, IFileManager fileManager)
{
    public async Task<ProductResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var product = await db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.ShippingInfo)
            .Include(x => x.Medias)
            .Include(x => x.Options).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.ShippingInfo)
            .Include(x => x.Metric)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (product is null) return null;

        var productInventory = await inventoryDb.ProductInventories
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ProductId == product.Id, ct);
        var variantIds = product.Variants.Select(x => x.Id).ToList();
        var variantInventories = await inventoryDb.VariantInventories
            .AsNoTracking()
            .Include(x => x.Tracking)
            .Where(x => variantIds.Contains(x.VariantId))
            .ToDictionaryAsync(x => x.VariantId, ct);

        return ProductMapper.ToResponse(product, fileManager, productInventory, variantInventories);
    }
}
