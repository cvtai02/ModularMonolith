using Intermediary.Events.Inventory;
using Microsoft.EntityFrameworkCore;
using Order.Core.Notifications;
using SharedKernel.Abstractions.Contracts;

namespace Order.Core.EventHandlers;

public class ReservationRejectedHandler(
    OrderDbContext db,
    OrderRealtimeNotifier realtimeNotifier) : IIntegrationEventHandler<ReservationRejected>
{
    public async Task Handle(ReservationRejected @event, CancellationToken ct = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Code == @event.OrderCode, ct);
        if (order is null || order.Status != Entities.OrderStatus.PendingPayment)
            return;

        order.SetRejectionReason(BuildReason(@event.Errors));
        order.SetStatus(Entities.OrderStatus.Cancelled);
        await db.SaveChangesAsync(ct);

        await realtimeNotifier.NotifyOrderRejectedAsync(order, ct);
    }

    private static string BuildReason(IReadOnlyDictionary<string, string[]> errors)
    {
        if (errors.Count == 0)
            return "Inventory reservation was rejected.";

        return string.Join("; ", errors.Select(x => $"{x.Key}: {string.Join(", ", x.Value)}"));
    }
}
