using Inventory.Core.Entities;
using Inventory.DTOs.Inventory;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace Inventory.Core.Usecases.Inventory;

public class ImportVariantInventory(InventoryDbContext db)
{
    public async Task<ImportVariantInventoryResponse> ExecuteAsync(
        ImportVariantInventoryRequest request,
        CancellationToken ct)
    {
        request ??= new ImportVariantInventoryRequest();
        request.Rows ??= [];

        Validate(request);

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        var variantIds = request.Rows.Select(x => x.VariantId).Distinct().ToList();
        var inventories = await db.VariantInventories
            .Include(x => x.Tracking)
            .Where(x => variantIds.Contains(x.VariantId))
            .ToDictionaryAsync(x => x.VariantId, ct);

        var responseRows = new List<ImportVariantInventoryRowResponse>();
        var referenceId = string.IsNullOrWhiteSpace(request.ReferenceId) ? null : request.ReferenceId.Trim();
        var note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();

        foreach (var row in request.Rows)
        {
            if (!inventories.TryGetValue(row.VariantId, out var inventory))
            {
                inventory = new VariantInventory
                {
                    VariantId = row.VariantId,
                    Tracking = new VariantTracking { VariantId = row.VariantId }
                };
                inventory.ApplyVariantInventory(trackInventory: true, allowBackorder: false, lowStockThreshold: 0);
                db.VariantInventories.Add(inventory);
                inventories[row.VariantId] = inventory;
            }
            else if (inventory.Tracking is null)
            {
                inventory.Tracking = new VariantTracking { VariantId = row.VariantId };
            }

            var previousQuantity = inventory.Tracking.OnHand;
            inventory.Tracking.OnHand = row.Quantity;

            var delta = row.Quantity - previousQuantity;
            if (delta != 0)
            {
                db.Transactions.Add(new Transaction
                {
                    VariantId = row.VariantId,
                    Type = TransactionType.Adjust,
                    Quantity = delta,
                    ReferenceId = referenceId,
                    Note = note
                });
            }

            responseRows.Add(new ImportVariantInventoryRowResponse
            {
                VariantId = row.VariantId,
                Status = delta == 0 ? "Skipped" : "Applied",
                Message = delta == 0 ? "Quantity unchanged." : "Quantity imported.",
                PreviousQuantity = previousQuantity,
                NewQuantity = row.Quantity
            });
        }

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new ImportVariantInventoryResponse
        {
            TotalCount = responseRows.Count,
            AppliedCount = responseRows.Count(x => x.Status == "Applied"),
            SkippedCount = responseRows.Count(x => x.Status == "Skipped"),
            FailedCount = 0,
            Rows = responseRows
        };
    }

    private static void Validate(ImportVariantInventoryRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        var rowErrors = new List<string>();

        if (request.Rows.Count == 0)
            rowErrors.Add("At least one variant inventory row is required.");

        if (request.ReferenceId?.Length > 200)
            errors[nameof(request.ReferenceId)] = ["Reference id cannot exceed 200 characters."];

        if (request.Note?.Length > 1000)
            errors[nameof(request.Note)] = ["Note cannot exceed 1000 characters."];

        var invalidVariantIds = request.Rows
            .Where(x => x.VariantId <= 0)
            .Select(x => x.VariantId)
            .Distinct()
            .ToList();
        if (invalidVariantIds.Count > 0)
            rowErrors.Add($"Variant ids must be greater than zero: {string.Join(", ", invalidVariantIds)}.");

        var negativeQuantityVariantIds = request.Rows
            .Where(x => x.Quantity < 0)
            .Select(x => x.VariantId)
            .Distinct()
            .ToList();
        if (negativeQuantityVariantIds.Count > 0)
            rowErrors.Add($"Quantity must be non-negative for variant ids: {string.Join(", ", negativeQuantityVariantIds)}.");

        var duplicateVariantIds = request.Rows
            .GroupBy(x => x.VariantId)
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToList();
        if (duplicateVariantIds.Count > 0)
            rowErrors.Add($"Variant ids must be unique: {string.Join(", ", duplicateVariantIds)}.");

        if (rowErrors.Count > 0)
            errors[nameof(request.Rows)] = rowErrors.ToArray();

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }
}
