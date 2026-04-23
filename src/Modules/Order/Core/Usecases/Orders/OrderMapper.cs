using Order.Core.DTOs;
using OrderEntity = Order.Core.Entities.Order;

namespace Order.Core.Usecases.Orders;

internal static class OrderMapper
{
    internal static OrderResponse ToResponse(OrderEntity o) => new()
    {
        Id = o.Id,
        Code = o.Code,
        CustomerId = o.CustomerId,
        Status = o.Status,
        CurrencyCode = o.CurrencyCode,
        TotalAmount = o.TotalAmount,
        CreatedAt = o.Created,
        Lines = o.Lines.Select(l => new OrderLineResponse
        {
            Id = l.Id,
            VariantId = l.VariantId,
            ProductName = l.ProductName,
            UnitPrice = l.UnitPrice,
            Quantity = l.Quantity,
            Subtotal = l.Subtotal,
        }).ToList(),
    };
}
