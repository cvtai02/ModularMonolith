using Inventory.DTOs.Inventory;
using Inventory.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace Inventory.Core.Usecases.Inventory;

[UsecaseInject]
public class InitializeProductInventory(InventoryDbContext db)
{
    public async Task<InitializeProductInventoryResponse> ExecuteAsync(
        string productId,
        InitializeProductInventoryRequest request,
        CancellationToken ct)
    {
        request ??= new InitializeProductInventoryRequest();
        productId = string.IsNullOrWhiteSpace(productId) ? string.Empty : productId.Trim();
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
                    ProductId = productId,
                    VariantId = variantRequest.VariantId,
                    Tracking = new VariantTracking { VariantId = variantRequest.VariantId }
                };
                db.VariantInventories.Add(variantInventory);
            }
            else
            {
                variantInventory.ProductId = productId;
                if (variantInventory.Tracking is null)
                    variantInventory.Tracking = new VariantTracking { VariantId = variantRequest.VariantId };
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
        var invalidVariantIds = request.Variants
            .Where(x => string.IsNullOrWhiteSpace(x.VariantId))
            .Select(x => x.VariantId)
            .ToList();

        var duplicateVariantIds = request.Variants
            .GroupBy(x => x.VariantId)
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToList();

        if (invalidVariantIds.Count > 0 || duplicateVariantIds.Count > 0)
        {
            var errors = new List<string>();
            if (invalidVariantIds.Count > 0)
                errors.Add("Variant ids are required.");
            if (duplicateVariantIds.Count > 0)
                errors.Add("Variant inventory configs must be unique by variant id.");

            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(request.Variants)] = errors.ToArray()
                });
        }
    }

    private async Task<InitializeProductInventoryResponse> BuildResponse(string productId, CancellationToken ct)
    {
        var productInventory = await db.ProductInventories
            .AsNoTracking()
            .FirstAsync(x => x.ProductId == productId, ct);

        var variants = await db.VariantInventories
            .AsNoTracking()
            .Include(x => x.Tracking)
            .Where(x => x.ProductId == productId && x.Tracking != null)
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
