using Microsoft.EntityFrameworkCore;
using Order.DTOs.Orders;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace Order.Core.Usecases.Orders;

[UsecaseInject]
public class ListOrders(OrderDbContext db, IUser user)
{
    public Task<PaginatedList<OrderSummaryResponse>> ExecuteAsync(ListOrdersRequest request, CancellationToken ct)
        => ExecuteAsync(request, customerId: user.Id, ct);

    public Task<PaginatedList<OrderSummaryResponse>> ExecuteAdminAsync(ListOrdersRequest request, CancellationToken ct)
        => ExecuteAsync(request, customerId: null, ct);

    private async Task<PaginatedList<OrderSummaryResponse>> ExecuteAsync(
        ListOrdersRequest request,
        string? customerId,
        CancellationToken ct)
    {
        var query = db.Orders
            .AsNoTracking()
            .Include(x => x.Lines)
            .AsQueryable();

        if (customerId is not null)
            query = query.Where(x => x.CustomerId == customerId);

        if (request.Status is not null)
            query = query.Where(x => x.Status == request.Status);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x =>
                x.Code.ToLower().Contains(search) ||
                (x.CustomerId != null && x.CustomerId.ToLower().Contains(search)));
        }

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.Created)
            .ThenByDescending(x => x.Code)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new OrderSummaryResponse
            {
                Code = x.Code,
                CustomerId = x.CustomerId,
                Status = x.Status,
                CurrencyCode = x.CurrencyCode,
                TotalAmount = x.TotalAmount,
                RejectionReason = x.RejectionReason,
                LineCount = x.Lines.Count,
                CreatedAt = x.Created
            })
            .ToListAsync(ct);

        return new PaginatedList<OrderSummaryResponse>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
