using Microsoft.EntityFrameworkCore;
using Order.Core.DTOs;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;
using OrderEntity = Order.Core.Entities.Order;

namespace Order.Core.Usecases.Orders;

public class CreateOrder(OrderDbContext db)
{
    public async Task<OrderResponse> ExecuteAsync(CreateOrderRequest request, CancellationToken ct)
    {
        var order = new OrderEntity();
        order.SetCode(UlidGenerator.NewUlid());
        order.SetCurrency(request.CurrencyCode);

        if (request.CustomerId is not null)
            order.CustomerId = request.CustomerId.Trim();

        foreach (var line in request.Lines)
        {
            var errors = ValidateLine(line);
            if (errors.Count > 0) throw new ValidationException("Validation failed", errors);
            order.AddLine(line.VariantId, line.ProductName.Trim(), line.UnitPrice, line.Quantity);
        }

        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        var created = await db.Orders
            .AsNoTracking()
            .Include(x => x.Lines)
            .FirstAsync(x => x.Id == order.Id, ct);

        return OrderMapper.ToResponse(created);
    }

    private static Dictionary<string, string[]> ValidateLine(CreateOrderLineRequest line)
    {
        var errors = new Dictionary<string, string[]>();

        if (line.VariantId <= 0)
            errors[nameof(line.VariantId)] = ["VariantId must be greater than zero."];

        if (string.IsNullOrWhiteSpace(line.ProductName))
            errors[nameof(line.ProductName)] = ["Product name is required."];

        if (line.UnitPrice < 0)
            errors[nameof(line.UnitPrice)] = ["Unit price cannot be negative."];

        if (line.Quantity <= 0)
            errors[nameof(line.Quantity)] = ["Quantity must be greater than zero."];

        return errors;
    }
}
