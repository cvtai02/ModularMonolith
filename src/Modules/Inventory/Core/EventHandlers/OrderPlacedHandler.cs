using Intermediary.Events.Inventory;
using Intermediary.Events.Order;
using Inventory.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Contracts;
using SharedKernel.Abstractions.Services;

namespace Inventory.Core.EventHandlers;

public class OrderPlacedHandler(InventoryDbContext db, IEventBus eventBus) : IEventHandler<OrderPlaced>
{
    public async Task Handle(OrderPlaced @event, CancellationToken ct = default)
    {
        var reservations = await db.Reservations
            .Include(x => x.Variant).ThenInclude(x => x.Tracking)
            .Where(x => x.OrderId == @event.OrderId && x.Status == ReservationStatus.Active)
            .ToListAsync(ct);

        if (reservations.Count == 0)
            return;

        foreach (var reservation in reservations)
        {
            if (reservation.Variant.TrackInventory)
            {
                reservation.Variant.Tracking.OnHand -= reservation.Quantity;
                reservation.Variant.Tracking.Reserved -= reservation.Quantity;
            }

            reservation.Status = ReservationStatus.Confirmed;
            db.Transactions.Add(new Transaction
            {
                VariantId = reservation.VariantId,
                Type = TransactionType.Out,
                Quantity = reservation.Quantity,
                ReferenceId = @event.OrderId.ToString(),
                Note = $"Committed for order {@event.OrderCode}"
            });
        }

        await db.SaveChangesAsync(ct);

        await eventBus.Publish(new ReservationCommited
        {
            OrderId = @event.OrderId,
            ReservationId = @event.ReservationId,
            Items = reservations
                .Select(x => new InventoryReservationItem
                {
                    VariantId = x.VariantId,
                    Quantity = x.Quantity
                })
                .ToList()
        }, ct);
    }
}
