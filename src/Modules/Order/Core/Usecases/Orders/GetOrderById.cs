using Microsoft.EntityFrameworkCore;
using Order.DTOs.Orders;
using SharedKernel.Abstractions.Services;

namespace Order.Core.Usecases.Orders;

[UsecaseInject]
public class GetOrderByCode(OrderDbContext db, IUser user)
{
    public Task<OrderResponse?> ExecuteAsync(string code, CancellationToken ct)
        => ExecuteAsync(code, customerId: user.Id, ct);

    public Task<OrderResponse?> ExecuteAdminAsync(string code, CancellationToken ct)
        => ExecuteAsync(code, customerId: null, ct);

    private async Task<OrderResponse?> ExecuteAsync(string code, string? customerId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(code))
            return null;

        var normalizedCode = code.Trim();
        var query = db.Orders
            .AsNoTracking()
            .Include(x => x.Lines)
            .Where(x => x.Code == normalizedCode);

        if (customerId is not null)
            query = query.Where(x => x.CustomerId == customerId);

        var order = await query.FirstOrDefaultAsync(ct);

        return order is null ? null : OrderMapper.ToResponse(order);
    }
}
