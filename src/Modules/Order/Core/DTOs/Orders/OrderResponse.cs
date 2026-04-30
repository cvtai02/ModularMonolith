using Order.Core.Entities;
using SharedKernel.DTOs;

namespace Order.Core.DTOs.Orders;

public class OrderResponse
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? CustomerId { get; set; }
    public OrderStatus Status { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int? InventoryReservationId { get; set; }
    public string? RejectionReason { get; set; }
    public Address? ShippingAddress { get; set; }
    public List<OrderLineResponse> Lines { get; set; } = [];
}

public class OrderLineResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int VariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}
