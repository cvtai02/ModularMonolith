using Intermediary.Events.Inventory;
using Intermediary.Events.Order;
using Inventory.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Inventory.Core.EventHandlers;

public class OrderPlacedHandler(InventoryDbContext db) : IIntegrationEventHandler<OrderPlaced>
{
    public async Task Handle(OrderPlaced @event, CancellationToken ct = default)
    {
        var reservation = await db.Reservations
            .Include(x => x.ReservationLines)
                .ThenInclude(x => x.Variant)
                .ThenInclude(x => x.Tracking)
            .FirstOrDefaultAsync(x => x.OrderCode == @event.OrderCode && x.Status == ReservationStatus.Active, ct);

        if (reservation is null)
            return;

        foreach (var line in reservation.ReservationLines)
        {
            if (line.Variant.TrackInventory)
            {
                line.Variant.Tracking.OnHand -= line.Quantity;
                line.Variant.Tracking.Reserved -= line.Quantity;
            }

            db.Transactions.Add(new Transaction
            {
                VariantId = line.VariantId,
                Type = TransactionType.Out,
                Quantity = line.Quantity,
                ReferenceId = @event.OrderCode,
                Note = $"Committed for order {@event.OrderCode}"
            });
        }

        reservation.Status = ReservationStatus.Confirmed;
        reservation.Events.Add(new ReservationCommited
        {
            OrderCode = @event.OrderCode,
            ReservationId = reservation.Id,
            Items = reservation.ReservationLines
                .Select(x => new InventoryReservationItem
                {
                    VariantId = x.VariantId,
                    Quantity = x.Quantity
                })
                .ToList()
        });

        await db.SaveChangesAsync(ct);
    }
}
