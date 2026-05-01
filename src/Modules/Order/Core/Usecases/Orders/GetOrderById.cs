using Microsoft.EntityFrameworkCore;
using Order.DTOs.Orders;

namespace Order.Core.Usecases.Orders;

public class GetOrderById(OrderDbContext db)
{
    public async Task<OrderResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var order = await db.Orders
            .AsNoTracking()
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return order is null ? null : OrderMapper.ToResponse(order);
    }
}
