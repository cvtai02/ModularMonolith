using Order.Core.DTOs.Orders;

namespace Order.Core.Usecases.Orders;

internal static class OrderMapper
{
    internal static OrderResponse ToResponse(Entities.Order order) => new()
    {
        Id = order.Id,
        Code = order.Code,
        CustomerId = order.CustomerId,
        Status = order.Status,
        CurrencyCode = order.CurrencyCode,
        TotalAmount = order.TotalAmount,
        InventoryReservationId = order.InventoryReservationId,
        RejectionReason = order.RejectionReason,
        ShippingAddress = order.ShippingAddress,
        Lines = order.Lines
            .OrderBy(x => x.Id)
            .Select(x => new OrderLineResponse
            {
                Id = x.Id,
                ProductId = x.ProductId,
                VariantId = x.VariantId,
                ProductName = x.ProductName,
                VariantName = x.VariantName,
                ImageUrl = x.ImageUrl,
                UnitPrice = x.UnitPrice,
                Quantity = x.Quantity,
                Subtotal = x.Subtotal
            })
            .ToList()
    };

    internal static OrderSummaryResponse ToSummary(Entities.Order order) => new()
    {
        Id = order.Id,
        Code = order.Code,
        CustomerId = order.CustomerId,
        Status = order.Status,
        CurrencyCode = order.CurrencyCode,
        TotalAmount = order.TotalAmount,
        RejectionReason = order.RejectionReason,
        LineCount = order.Lines.Count,
        CreatedAt = order.Created
    };
}
