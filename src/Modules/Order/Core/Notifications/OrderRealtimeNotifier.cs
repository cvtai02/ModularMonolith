using Microsoft.AspNetCore.SignalR;
using Order.Api.Hubs;

namespace Order.Core.Notifications;

public class OrderRealtimeNotifier(IHubContext<OrderHub> orderHubContext)
{
    public Task NotifyOrderPlacedAsync(Entities.Order order, int reservationId, CancellationToken ct)
    {
        var message = new OrderPlacedNotification
        {
            OrderId = order.Id,
            OrderCode = order.Code,
            ReservationId = reservationId,
            Status = order.Status.ToString()
        };

        return orderHubContext.Clients
            .Group(OrderRealtimeGroups.Order(order.Id))
            .SendAsync("OrderPlaced", message, ct);
    }
}
