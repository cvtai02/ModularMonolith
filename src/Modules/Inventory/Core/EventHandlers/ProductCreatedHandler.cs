using Intermediary.Events.ProductCatalog;
using Inventory.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Inventory.Core.EventHandlers;

public class ProductCreatedHandler(InventoryDbContext db) : IIntegrationEventHandler<ProductCreated>
{
    public async Task Handle(ProductCreated @event, CancellationToken ct = default)
    {
        var productInventory = await db.ProductInventories
            .FirstOrDefaultAsync(x => x.ProductId == @event.ProductId, ct);

        if (productInventory is null)
        {
            productInventory = new ProductInventory { ProductId = @event.ProductId };
            db.ProductInventories.Add(productInventory);
        }

        productInventory.SetInventoryPolicy(@event.TrackInventory, @event.AllowBackorder, @event.LowStockThreshold);

        var variantIds = @event.Variants.Select(x => x.VariantId).ToList();
        var existingByVariantId = await db.VariantInventories
            .Include(x => x.Tracking)
            .Where(x => variantIds.Contains(x.VariantId))
            .ToDictionaryAsync(x => x.VariantId, ct);

        foreach (var variantConfig in @event.Variants)
        {
            if (!existingByVariantId.TryGetValue(variantConfig.VariantId, out var variantInventory))
            {
                variantInventory = new VariantInventory
                {
                    VariantId = variantConfig.VariantId,
                    Tracking = new VariantTracking { VariantId = variantConfig.VariantId }
                };
                db.VariantInventories.Add(variantInventory);
            }
            else if (variantInventory.Tracking is null)
            {
                variantInventory.Tracking = new VariantTracking { VariantId = variantConfig.VariantId };
            }

            variantInventory.Tracking.OnHand = variantConfig.Quantity;
            variantInventory.Tracking.Reserved = 0;

            if (variantConfig.UseProductInventory)
            {
                variantInventory.ApplyProductInventory(productInventory);
            }
            else
            {
                variantInventory.ApplyVariantInventory(
                    variantConfig.TrackInventory,
                    variantConfig.AllowBackorder,
                    variantConfig.LowStockThreshold);
            }
        }

        await db.SaveChangesAsync(ct);
    }
}
