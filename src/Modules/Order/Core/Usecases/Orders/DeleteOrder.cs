using Microsoft.EntityFrameworkCore;
using Order.Core.Entities;
using SharedKernel.Exceptions;

namespace Order.Core.Usecases.Orders;

public class DeleteOrder(OrderDbContext db)
{
    public async Task<bool?> ExecuteAsync(int id, CancellationToken ct)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (order is null) return null;

        if (order.Status != OrderStatus.Draft && order.Status != OrderStatus.Cancelled)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                ["status"] = ["Only draft or cancelled orders can be deleted."]
            });

        db.Orders.Remove(order);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
