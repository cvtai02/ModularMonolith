using Account.Api.Hubs;
using Account.Core.Notifications;
using Intermediary.Events.Order;
using Microsoft.AspNetCore.SignalR;
using SharedKernel.Abstractions.Contracts;

namespace Account.Core.EventHandlers;

public class AdminOrderPlacedHandler(IHubContext<NotificationHub> hubContext) : IEventHandler<AdminOrderPlaced>
{
    public Task Handle(AdminOrderPlaced @event, CancellationToken ct = default)
    {
        var message = new AdminOrderPlacedNotification
        {
            OrderId = @event.OrderId,
            OrderCode = @event.OrderCode,
            CustomerId = @event.CustomerId,
            TotalAmount = @event.TotalAmount,
            CurrencyCode = @event.CurrencyCode,
            ReservationId = @event.ReservationId,
            Status = @event.Status,
            CreatedAt = @event.CreatedAt
        };

        return hubContext.Clients.All.SendAsync("NotificationReceived", message, ct);
    }
}
