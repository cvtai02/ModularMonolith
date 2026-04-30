using Intermediary.Events.Inventory;
using Intermediary.Events.Order;
using Inventory.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Contracts;
using SharedKernel.Abstractions.Services;

namespace Inventory.Core.EventHandlers;

public class OrderSubmittedHandler(InventoryDbContext db, IEventBus eventBus) : IEventHandler<OrderSubmitted>
{
    private static readonly TimeSpan ReservationTtl = TimeSpan.FromMinutes(15);

    public async Task Handle(OrderSubmitted @event, CancellationToken ct = default)
    {
        if (@event.Items.Count == 0)
        {
            await PublishRejected(@event.OrderId, new Dictionary<string, string[]>
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
            await PublishRejected(@event.OrderId, errors, ct);
            return;
        }

        var expiresAt = DateTimeOffset.UtcNow.Add(ReservationTtl);
        foreach (var item in @event.Items)
        {
            var inventory = inventories[item.VariantId];
            if (inventory.TrackInventory)
                inventory.Tracking.Reserved += item.Quantity;

            db.Reservations.Add(new Reservation
            {
                VariantId = item.VariantId,
                OrderId = @event.OrderId,
                Quantity = item.Quantity,
                Status = ReservationStatus.Active,
                ExpiresAt = expiresAt
            });

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

        var reservationId = await db.Reservations
            .Where(x => x.OrderId == @event.OrderId && x.Status == ReservationStatus.Active)
            .OrderBy(x => x.Id)
            .Select(x => x.Id)
            .FirstAsync(ct);

        await eventBus.Publish(new InventoryReserved
        {
            OrderId = @event.OrderId,
            ReservationId = reservationId,
            ExpiresAt = expiresAt,
            Items = @event.Items
                .Select(x => new InventoryReservationItem
                {
                    VariantId = x.VariantId,
                    Quantity = x.Quantity
                })
                .ToList()
        }, ct);
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

    private Task PublishRejected(
        int orderId,
        IReadOnlyDictionary<string, string[]> errors,
        CancellationToken ct) =>
        eventBus.Publish(new ReservationRejected
        {
            OrderId = orderId,
            Errors = errors
        }, ct);
}
