using Intermediary.Events.Inventory;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Contracts;

namespace Order.Core.EventHandlers;

public class ReservationExpiredHandler(OrderDbContext db) : IEventHandler<ReservationExpired>
{
    public async Task Handle(ReservationExpired @event, CancellationToken ct = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == @event.OrderId, ct);
        if (order is null || order.Status != Entities.OrderStatus.PendingInventory)
            return;

        order.SetRejectionReason("Inventory reservation expired.");
        order.SetStatus(Entities.OrderStatus.Rejected);
        await db.SaveChangesAsync(ct);
    }
}
