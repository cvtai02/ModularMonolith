using Microsoft.EntityFrameworkCore;
using Order.Core.DTOs;
using Order.Core.Entities;
using SharedKernel.DTOs;

namespace Order.Core.Usecases.Orders;

public class ListOrders(OrderDbContext db)
{
    public async Task<PaginatedList<OrderResponse>> ExecuteAsync(
        int pageNumber, int pageSize, string? search, OrderStatus? status, CancellationToken ct)
    {
        var query = db.Orders.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x => x.Code.ToLower().Contains(s) ||
                                     (x.CustomerId != null && x.CustomerId.ToLower().Contains(s)));
        }

        if (status.HasValue)
            query = query.Where(x => x.Status == status.Value);

        var totalCount = await query.CountAsync(ct);
        var orders = await query
            .OrderByDescending(x => x.Created)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PaginatedList<OrderResponse>(orders.Select(OrderMapper.ToResponse).ToList(), totalCount, pageNumber, pageSize);
    }
}
