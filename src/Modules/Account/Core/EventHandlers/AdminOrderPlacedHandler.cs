using System.Text.Json;
using Account.Api.Hubs;
using Account.Core.Entities;
using Account.Core.Notifications;
using Intermediary.Events.Order;
using Microsoft.AspNetCore.SignalR;
using SharedKernel.Authorization;
using SharedKernel.Abstractions.Contracts;

namespace Account.Core.EventHandlers;

public class AdminOrderPlacedHandler(
    AccountDbContext db,
    IHubContext<NotificationHub> hubContext) : IIntegrationEventHandler<AdminOrderPlaced>
{
    private static readonly JsonSerializerOptions PayloadJsonOptions = new(JsonSerializerDefaults.Web);

    public async Task Handle(AdminOrderPlaced @event, CancellationToken ct = default)
    {
        var message = new AdminOrderPlacedNotification
        {
            OrderCode = @event.OrderCode,
            CustomerId = @event.CustomerId,
            TotalAmount = @event.TotalAmount,
            CurrencyCode = @event.CurrencyCode,
            ReservationId = @event.ReservationId,
            Status = @event.Status,
            CreatedAt = @event.CreatedAt
        };

        var notification = new Notification();
        notification.SetRecipient(null, Roles.TenantAdmin);
        notification.SetContent(
            message.Type,
            $"Order {message.OrderCode} was placed",
            $"Order {message.OrderCode} is now {message.Status}.",
            "Order",
            message.OrderCode,
            JsonSerializer.Serialize(message, PayloadJsonOptions));

        db.Notifications.Add(notification);
        await db.SaveChangesAsync(ct);

        await hubContext.Clients.All.SendAsync("NotificationReceived", message, ct);
    }
}
