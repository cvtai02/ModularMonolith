using Order.Core.Entities;

namespace Order.DTOs.Orders;

public class OrderSummaryResponse
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? CustomerId { get; set; }
    public OrderStatus Status { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string? RejectionReason { get; set; }
    public int LineCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
