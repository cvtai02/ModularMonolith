using Intermediary.Events.Order;
using Inventory.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Inventory.Core.EventHandlers;

public class OrderCanceledHandler(InventoryDbContext db) : IIntegrationEventHandler<OrderCanceled>
{
    public async Task Handle(OrderCanceled @event, CancellationToken ct = default)
    {
        var reservation = await db.Reservations
            .Include(x => x.ReservationLines)
                .ThenInclude(x => x.Variant)
                .ThenInclude(x => x.Tracking)
            .FirstOrDefaultAsync(x =>
                x.OrderCode == @event.OrderCode &&
                x.Status == ReservationStatus.Active &&
                (@event.ReservationId == null || x.Id == @event.ReservationId), ct);

        if (reservation is null)
            return;

        foreach (var line in reservation.ReservationLines)
        {
            if (line.Variant.TrackInventory)
                line.Variant.Tracking.Reserved -= line.Quantity;

            db.Transactions.Add(new Transaction
            {
                VariantId = line.VariantId,
                Type = TransactionType.Release,
                Quantity = line.Quantity,
                ReferenceId = @event.OrderCode,
                Note = $"Released for cancelled order {@event.OrderCode}"
            });
        }

        reservation.Status = ReservationStatus.Released;
        await db.SaveChangesAsync(ct);
    }
}
