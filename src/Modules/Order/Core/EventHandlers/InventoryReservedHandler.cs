using Intermediary.Events.Inventory;
using Intermediary.Events.Order;
using Microsoft.EntityFrameworkCore;
using Order.Core.Notifications;

namespace Order.Core.EventHandlers;

public class InventoryReservedHandler(
    OrderDbContext db,
    OrderRealtimeNotifier realtimeNotifier) : IIntegrationEventHandler<InventoryReserved>
{
    public async Task Handle(InventoryReserved @event, CancellationToken ct = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Code == @event.OrderCode, ct);
        if (order is null || order.Status != Entities.OrderStatus.PendingPayment)
            return;

        order.Events.Add(new AdminOrderPlaced
        {
            OrderCode = order.Code,
            CustomerId = order.CustomerId,
            TotalAmount = order.TotalAmount,
            CurrencyCode = order.CurrencyCode,
            ReservationId = @event.ReservationId,
            Status = order.Status.ToString(),
            CreatedAt = DateTimeOffset.UtcNow
        });

        await db.SaveChangesAsync(ct);

        await realtimeNotifier.NotifyOrderPlacedAsync(order, @event.ReservationId, ct);
    }
}
