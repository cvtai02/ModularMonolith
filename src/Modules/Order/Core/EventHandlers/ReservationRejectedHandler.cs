using Intermediary.Events.Inventory;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Contracts;

namespace Order.Core.EventHandlers;

public class ReservationRejectedHandler(OrderDbContext db) : IEventHandler<ReservationRejected>
{
    public async Task Handle(ReservationRejected @event, CancellationToken ct = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == @event.OrderId, ct);
        if (order is null || order.Status != Entities.OrderStatus.PendingInventory)
            return;

        order.SetRejectionReason(BuildReason(@event.Errors));
        order.SetStatus(Entities.OrderStatus.Rejected);
        await db.SaveChangesAsync(ct);
    }

    private static string BuildReason(IReadOnlyDictionary<string, string[]> errors)
    {
        if (errors.Count == 0)
            return "Inventory reservation was rejected.";

        return string.Join("; ", errors.Select(x => $"{x.Key}: {string.Join(", ", x.Value)}"));
    }
}
