using Inventory.DTOs.Inventory;
using Inventory.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace Inventory.Core.Usecases.Inventory;

public class InitializeProductInventory(InventoryDbContext db)
{
    public async Task<InitializeProductInventoryResponse> ExecuteAsync(
        int productId,
        InitializeProductInventoryRequest request,
        CancellationToken ct)
    {
        Validate(request);

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        var productInventory = await db.ProductInventories
            .FirstOrDefaultAsync(x => x.ProductId == productId, ct);

        if (productInventory is null)
        {
            productInventory = new ProductInventory { ProductId = productId };
            db.ProductInventories.Add(productInventory);
        }

        productInventory.SetInventoryPolicy(request.TrackInventory, request.AllowBackorder, request.LowStockThreshold);

        foreach (var variantRequest in request.Variants)
        {
            var variantInventory = await db.VariantInventories
                .Include(x => x.Tracking)
                .FirstOrDefaultAsync(x => x.VariantId == variantRequest.VariantId, ct);

            if (variantInventory is null)
            {
                variantInventory = new VariantInventory
                {
                    VariantId = variantRequest.VariantId,
                    Tracking = new VariantTracking { VariantId = variantRequest.VariantId }
                };
                db.VariantInventories.Add(variantInventory);
            }

            if (variantRequest.UseProductInventory)
                variantInventory.ApplyProductInventory(productInventory);
            else
                variantInventory.ApplyVariantInventory(
                    variantRequest.TrackInventory,
                    variantRequest.AllowBackorder,
                    variantRequest.LowStockThreshold);
            variantInventory.Tracking.OnHand = variantRequest.Quantity;
        }

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return await BuildResponse(productId, ct);
    }

    private static void Validate(InitializeProductInventoryRequest request)
    {
        var duplicateVariantIds = request.Variants
            .GroupBy(x => x.VariantId)
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToList();

        if (duplicateVariantIds.Count > 0)
        {
            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(request.Variants)] = ["Variant inventory configs must be unique by variant id."]
                });
        }
    }

    private async Task<InitializeProductInventoryResponse> BuildResponse(int productId, CancellationToken ct)
    {
        var productInventory = await db.ProductInventories
            .AsNoTracking()
            .FirstAsync(x => x.ProductId == productId, ct);

        var variants = await db.VariantInventories
            .AsNoTracking()
            .Include(x => x.Tracking)
            .Where(x => x.Tracking != null)
            .OrderBy(x => x.VariantId)
            .Select(x => new VariantInventoryResponse
            {
                VariantId = x.VariantId,
                UseProductInventory = x.UseProductInventory,
                TrackInventory = x.TrackInventory,
                AllowBackorder = x.AllowBackorder,
                LowStockThreshold = x.LowStockThreshold,
                Quantity = x.Tracking.OnHand,
                Reserved = x.Tracking.Reserved,
                Available = x.Tracking.Available
            })
            .ToListAsync(ct);

        return new InitializeProductInventoryResponse
        {
            ProductId = productInventory.ProductId,
            TrackInventory = productInventory.TrackInventory,
            AllowBackorder = productInventory.AllowBackorder,
            LowStockThreshold = productInventory.LowStockThreshold,
            Variants = variants
        };
    }
}
