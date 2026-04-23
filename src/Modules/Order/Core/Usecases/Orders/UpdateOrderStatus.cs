using Microsoft.EntityFrameworkCore;
using Order.Core.DTOs;
using SharedKernel.Exceptions;

namespace Order.Core.Usecases.Orders;

public class UpdateOrderStatus(OrderDbContext db)
{
    public async Task<OrderResponse?> ExecuteAsync(int id, UpdateOrderStatusRequest request, CancellationToken ct)
    {
        var order = await db.Orders
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (order is null) return null;

        try
        {
            order.SetStatus(request.Status);
        }
        catch (InvalidOperationException ex)
        {
            throw new ValidationException(ex.Message, new Dictionary<string, string[]>
            {
                [nameof(request.Status)] = [ex.Message]
            });
        }

        await db.SaveChangesAsync(ct);
        return OrderMapper.ToResponse(order);
    }
}
