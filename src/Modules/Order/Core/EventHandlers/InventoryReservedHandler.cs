using Intermediary.Events.Inventory;
using Intermediary.Events.Order;
using Microsoft.EntityFrameworkCore;
using Order.Core.Notifications;
using SharedKernel.Abstractions.Contracts;
using SharedKernel.Abstractions.Services;

namespace Order.Core.EventHandlers;

public class InventoryReservedHandler(
    OrderDbContext db,
    IEventBus eventBus,
    OrderRealtimeNotifier realtimeNotifier) : IEventHandler<InventoryReserved>
{
    public async Task Handle(InventoryReserved @event, CancellationToken ct = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == @event.OrderId, ct);
        if (order is null || order.Status != Entities.OrderStatus.PendingInventory)
            return;

        order.SetInventoryReservation(@event.ReservationId);
        order.SetStatus(Entities.OrderStatus.Placed);
        await db.SaveChangesAsync(ct);

        await realtimeNotifier.NotifyOrderPlacedAsync(order, @event.ReservationId, ct);
        await eventBus.Publish(new OrderPlaced
        {
            OrderId = order.Id,
            OrderCode = order.Code,
            ReservationId = @event.ReservationId
        }, ct);

        await eventBus.Publish(new AdminOrderPlaced
        {
            OrderId = order.Id,
            OrderCode = order.Code,
            CustomerId = order.CustomerId,
            TotalAmount = order.TotalAmount,
            CurrencyCode = order.CurrencyCode,
            ReservationId = @event.ReservationId,
            Status = order.Status.ToString(),
            CreatedAt = DateTimeOffset.UtcNow
        }, ct);
    }
}
