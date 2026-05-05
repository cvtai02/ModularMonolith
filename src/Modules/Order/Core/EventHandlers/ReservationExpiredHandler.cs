using Intermediary.Events.Inventory;
using Microsoft.EntityFrameworkCore;
using Order.Core.Notifications;
using SharedKernel.Abstractions.Contracts;

namespace Order.Core.EventHandlers;

public class ReservationExpiredHandler(
    OrderDbContext db,
    OrderRealtimeNotifier realtimeNotifier) : IIntegrationEventHandler<ReservationExpired>
{
    public async Task Handle(ReservationExpired @event, CancellationToken ct = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == @event.OrderId, ct);
        if (order is null || order.Status != Entities.OrderStatus.PendingInventory)
            return;

        order.SetRejectionReason("Inventory reservation expired.");
        order.SetStatus(Entities.OrderStatus.Rejected);
        await db.SaveChangesAsync(ct);

        await realtimeNotifier.NotifyOrderRejectedAsync(order, @event.ReservationId, ct);
    }
}
