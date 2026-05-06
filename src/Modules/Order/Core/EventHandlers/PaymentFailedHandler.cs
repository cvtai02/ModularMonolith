using Intermediary.Events.Order;
using Intermediary.Events.Payment;
using Microsoft.EntityFrameworkCore;
using Order.Core.Notifications;

namespace Order.Core.EventHandlers;

public class PaymentFailedHandler(
    OrderDbContext db,
    OrderRealtimeNotifier realtimeNotifier) : IIntegrationEventHandler<PaymentFailed>
{
    public async Task Handle(PaymentFailed @event, CancellationToken ct = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Code == @event.OrderCode && !x.IsDeleted, ct);
        if (order is null || order.Status != Entities.OrderStatus.PendingPayment)
            return;

        order.SetRejectionReason(@event.FailureReason ?? "Payment failed.");
        order.SetStatus(Entities.OrderStatus.Cancelled);
        order.Events.Add(new OrderCanceled
        {
            OrderCode = order.Code
        });

        await db.SaveChangesAsync(ct);
        await realtimeNotifier.NotifyOrderRejectedAsync(order, ct);
    }
}
