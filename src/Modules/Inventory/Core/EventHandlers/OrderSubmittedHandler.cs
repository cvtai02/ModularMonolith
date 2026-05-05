using Intermediary.Events.Inventory;
using Intermediary.Events.Order;
using Inventory.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Contracts;

namespace Inventory.Core.EventHandlers;

public class OrderSubmittedHandler(InventoryDbContext db) : IIntegrationEventHandler<OrderSubmitted>
{
    private static readonly TimeSpan ReservationTtl = TimeSpan.FromMinutes(15);

    public async Task Handle(OrderSubmitted @event, CancellationToken ct = default)
    {
        if (@event.Items.Count == 0)
        {
            await Reject(@event.OrderId, new Dictionary<string, string[]>
            {
                ["items"] = ["Order has no items to reserve."]
            }, ct);
            return;
        }

        var variantIds = @event.Items.Select(x => x.VariantId).Distinct().ToList();
        var inventories = await db.VariantInventories
            .Include(x => x.Tracking)
            .Where(x => variantIds.Contains(x.VariantId))
            .ToDictionaryAsync(x => x.VariantId, ct);

        var errors = Validate(@event, inventories);
        if (errors.Count > 0)
        {
            await Reject(@event.OrderId, errors, ct);
            return;
        }

        var expiresAt = DateTimeOffset.UtcNow.Add(ReservationTtl);
        var reservation = new Reservation
        {
            OrderId = @event.OrderId,
            Status = ReservationStatus.Active,
            ExpiresAt = expiresAt,
            ReservationLines = @event.Items
                .Select(x => new ReservationLine
                {
                    VariantId = x.VariantId,
                    Quantity = x.Quantity
                })
                .ToList()
        };

        reservation.Events.Add(new InventoryReserved
        {
            OrderId = @event.OrderId,
            ReservationId = reservation.Id,
            ExpiresAt = expiresAt,
            Items = @event.Items
                .Select(x => new InventoryReservationItem
                {
                    VariantId = x.VariantId,
                    Quantity = x.Quantity
                })
                .ToList()
        });
        db.Reservations.Add(reservation);

        foreach (var item in @event.Items)
        {
            var inventory = inventories[item.VariantId];
            if (inventory.TrackInventory)
                inventory.Tracking.Reserved += item.Quantity;

            db.Transactions.Add(new Transaction
            {
                VariantId = item.VariantId,
                Type = TransactionType.Reserve,
                Quantity = item.Quantity,
                ReferenceId = @event.OrderId.ToString(),
                Note = $"Reserved for order {@event.OrderCode}"
            });
        }

        await db.SaveChangesAsync(ct);
    }

    private static Dictionary<string, string[]> Validate(
        OrderSubmitted @event,
        IReadOnlyDictionary<int, VariantInventory> inventories)
    {
        var errors = new Dictionary<string, string[]>();
        var itemErrors = new List<string>();

        foreach (var item in @event.Items)
        {
            if (!inventories.TryGetValue(item.VariantId, out var inventory))
            {
                itemErrors.Add($"Inventory is not initialized for variant id {item.VariantId}.");
                continue;
            }

            if (!inventory.TrackInventory)
                continue;

            if (inventory.Tracking is null)
            {
                itemErrors.Add($"Inventory tracking is not initialized for variant id {item.VariantId}.");
                continue;
            }

            if (inventory.AllowBackorder)
                continue;

            if (inventory.Tracking.Available < item.Quantity)
                itemErrors.Add($"Insufficient stock for variant id {item.VariantId}.");
        }

        if (itemErrors.Count > 0)
            errors["items"] = itemErrors.ToArray();

        return errors;
    }

    private async Task Reject(
        int orderId,
        IReadOnlyDictionary<string, string[]> errors,
        CancellationToken ct)
    {
        var reservation = new Reservation
        {
            OrderId = orderId,
            Status = ReservationStatus.Released,
            ExpiresAt = DateTimeOffset.UtcNow
        };
        reservation.Events.Add(new ReservationRejected
        {
            OrderId = orderId,
            Errors = errors
        });

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync(ct);
    }
}
