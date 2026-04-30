using Intermediary.Events.Payment;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Contracts;

namespace Order.Core.EventHandlers;

public class PaymentSucceededHandler(OrderDbContext db) : IEventHandler<PaymentSucceeded>
{
    public async Task Handle(PaymentSucceeded @event, CancellationToken ct = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == @event.OrderId && !x.IsDeleted, ct);
        if (order is null || order.Status != Entities.OrderStatus.Placed)
            return;

        order.SetStatus(Entities.OrderStatus.Paid);
        await db.SaveChangesAsync(ct);
    }
}
