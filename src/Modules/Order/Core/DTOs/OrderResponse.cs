using Order.Core.Entities;

namespace Order.Core.DTOs;

public class OrderResponse
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? CustomerId { get; set; }
    public OrderStatus Status { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public List<OrderLineResponse> Lines { get; set; } = [];
    public DateTimeOffset CreatedAt { get; set; }
}
