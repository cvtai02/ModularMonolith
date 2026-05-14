using Microsoft.EntityFrameworkCore;

namespace Inventory.Core.Usecases.Inventory;

[UsecaseInject]
public class DeleteProductInventory(InventoryDbContext db)
{
    public async Task ExecuteAsync(string productId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(productId))
            return;

        productId = productId.Trim();

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        await db.VariantInventories
            .Where(x => x.ProductId == productId)
            .ExecuteDeleteAsync(ct);

        await db.ProductInventories
            .Where(x => x.ProductId == productId)
            .ExecuteDeleteAsync(ct);

        await transaction.CommitAsync(ct);
    }
}

