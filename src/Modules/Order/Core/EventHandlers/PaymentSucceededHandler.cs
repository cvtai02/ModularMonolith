using Intermediary.Events.Payment;
using Intermediary.Events.Order;
using Microsoft.EntityFrameworkCore;
using Order.Core.Notifications;
using SharedKernel.Abstractions.Contracts;

namespace Order.Core.EventHandlers;

public class PaymentSucceededHandler(
    OrderDbContext db,
    OrderRealtimeNotifier realtimeNotifier) : IIntegrationEventHandler<PaymentSucceeded>
{
    public async Task Handle(PaymentSucceeded @event, CancellationToken ct = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Code == @event.OrderCode && !x.IsDeleted, ct);
        if (order is null || order.Status != Entities.OrderStatus.PendingPayment)
            return;

        if (string.Equals(@event.Provider, "CashOnDelivery", StringComparison.OrdinalIgnoreCase))
        {
            order.SetStatus(Entities.OrderStatus.Placed);
            order.Events.Add(new OrderPlaced
            {
                OrderCode = order.Code
            });
            order.Events.Add(ToAdminOrderPlaced(order));
            await db.SaveChangesAsync(ct);

            await realtimeNotifier.NotifyOrderPlacedAsync(order, null, ct);
            return;
        }

        order.SetStatus(Entities.OrderStatus.Paid);
        order.Events.Add(new OrderPaid
        {
            OrderCode = order.Code,
            PaymentTransactionId = @event.PaymentTransactionId,
            Amount = @event.Amount,
            CurrencyCode = @event.CurrencyCode,
            PaidAt = @event.PaidAt
        });

        order.Events.Add(new OrderPlaced
        {
            OrderCode = order.Code
        });
        order.Events.Add(ToAdminOrderPlaced(order));
        await db.SaveChangesAsync(ct);

        await realtimeNotifier.NotifyOrderPaidAsync(order, ct);
    }

    private static AdminOrderPlaced ToAdminOrderPlaced(Entities.Order order) => new()
    {
        OrderCode = order.Code,
        CustomerId = order.CustomerId,
        TotalAmount = order.TotalAmount,
        CurrencyCode = order.CurrencyCode,
        Status = order.Status.ToString(),
        CreatedAt = DateTimeOffset.UtcNow
    };
}
