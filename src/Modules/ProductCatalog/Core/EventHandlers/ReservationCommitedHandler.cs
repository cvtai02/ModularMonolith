using Intermediary.Events.Inventory;
using Inventory;
using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;

namespace ProductCatalog.Core.EventHandlers;

public class ReservationCommitedHandler(
    ProductCatalogDbContext db,
    InventoryDbContext inventoryDb) : IIntegrationEventHandler<ReservationCommited>
{
    public async Task Handle(ReservationCommited @event, CancellationToken ct = default)
    {
        if (@event.Items.Count == 0)
        {
            return;
        }

        var quantityByVariantId = @event.Items
            .GroupBy(x => x.VariantId)
            .ToDictionary(x => x.Key, x => x.Sum(i => i.Quantity));

        var committedVariantIds = quantityByVariantId.Keys.ToList();
        var affectedProductIds = await db.Variants
            .Where(x => committedVariantIds.Contains(x.Id))
            .Select(x => x.ProductId)
            .Distinct()
            .ToListAsync(ct);

        if (affectedProductIds.Count == 0)
        {
            return;
        }

        var variants = await db.Variants
            .Include(x => x.Metric)
            .Include(x => x.Product)
                .ThenInclude(x => x.Metric)
            .Where(x => affectedProductIds.Contains(x.ProductId))
            .ToListAsync(ct);

        var variantIds = variants.Select(x => x.Id).ToList();
        var inventoryByVariantId = await inventoryDb.VariantInventories
            .AsNoTracking()
            .Include(x => x.Tracking)
            .Where(x => variantIds.Contains(x.VariantId))
            .ToDictionaryAsync(x => x.VariantId, ct);

        foreach (var variant in variants)
        {
            var variantMetric = EnsureVariantMetric(variant);
            if (inventoryByVariantId.TryGetValue(variant.Id, out var inventory))
            {
                variantMetric.Stock = inventory.Tracking?.OnHand ?? 0;
            }

            if (quantityByVariantId.TryGetValue(variant.Id, out var quantity))
            {
                variantMetric.Sold += quantity;
            }
        }

        foreach (var productGroup in variants.GroupBy(x => x.Product))
        {
            var productMetric = EnsureProductMetric(productGroup.Key);
            productMetric.Stock = productGroup.Sum(x => x.Metric?.Stock ?? 0);
            productMetric.Sold = productGroup.Sum(x => x.Metric?.Sold ?? 0);
        }

        await db.SaveChangesAsync(ct);
    }

    private VariantMetric EnsureVariantMetric(Variant variant)
    {
        if (variant.Metric is null)
        {
            variant.Metric = new VariantMetric { VariantId = variant.Id };
            db.VariantMetrics.Add(variant.Metric);
        }

        return variant.Metric;
    }

    private ProductMetric EnsureProductMetric(Product product)
    {
        if (product.Metric is null)
        {
            product.Metric = new ProductMetric { ProductId = product.Id };
            db.ProductMetrics.Add(product.Metric);
        }

        return product.Metric;
    }
}
