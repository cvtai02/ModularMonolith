using Microsoft.AspNetCore.SignalR;
using Order.Api.Hubs;

namespace Order.Core.Notifications;

public class OrderRealtimeNotifier(IHubContext<OrderHub> orderHubContext)
{
    public async Task NotifyOrderPlacedAsync(Entities.Order order, int reservationId, CancellationToken ct)
    {
        var placedMessage = new OrderPlacedNotification
        {
            OrderCode = order.Code,
            ReservationId = reservationId,
            Status = order.Status.ToString()
        };

        await orderHubContext.Clients
            .Group(OrderRealtimeGroups.Order(order.Code))
            .SendAsync("OrderPlaced", placedMessage, ct);

        await NotifyOrderChangedAsync(
            order,
            "OrderPlaced",
            reservationId,
            null,
            ct);
    }

    public Task NotifyOrderRejectedAsync(Entities.Order order, CancellationToken ct)
        => NotifyOrderRejectedAsync(order, null, ct);

    public Task NotifyOrderRejectedAsync(Entities.Order order, int? reservationId, CancellationToken ct)
        => NotifyOrderChangedAsync(
            order,
            "OrderRejected",
            reservationId,
            order.RejectionReason,
            ct);

    public Task NotifyOrderPaidAsync(Entities.Order order, CancellationToken ct)
        => NotifyOrderChangedAsync(
            order,
            "OrderPaid",
            null,
            null,
            ct);

    private Task NotifyOrderChangedAsync(
        Entities.Order order,
        string type,
        int? reservationId,
        string? rejectionReason,
        CancellationToken ct)
    {
        var message = new OrderNotification
        {
            Type = type,
            OrderCode = order.Code,
            Status = order.Status.ToString(),
            ReservationId = reservationId,
            RejectionReason = rejectionReason,
            OccurredAt = DateTimeOffset.UtcNow
        };

        var sends = new List<Task>
        {
            orderHubContext.Clients
                .Group(OrderRealtimeGroups.Order(order.Code))
                .SendAsync("OrderNotification", message, ct)
        };

        if (!string.IsNullOrWhiteSpace(order.CustomerId))
        {
            sends.Add(orderHubContext.Clients
                .Group(OrderRealtimeGroups.Customer(order.CustomerId))
                .SendAsync("OrderNotification", message, ct));
        }

        return Task.WhenAll(sends);
    }
}
