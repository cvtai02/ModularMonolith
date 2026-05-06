using Microsoft.EntityFrameworkCore;
using Order.DTOs.Orders;

namespace Order.Core.Usecases.Orders;

[UsecaseInject]
public class GetOrderByCode(OrderDbContext db)
{
    public async Task<OrderResponse?> ExecuteAsync(string code, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(code))
            return null;

        var normalizedCode = code.Trim();
        var order = await db.Orders
            .AsNoTracking()
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Code == normalizedCode, ct);

        return order is null ? null : OrderMapper.ToResponse(order);
    }
}
