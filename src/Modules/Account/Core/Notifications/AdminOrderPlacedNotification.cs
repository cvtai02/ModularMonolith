namespace Account.Core.Notifications;

public class AdminOrderPlacedNotification
{
    public string Type { get; init; } = "OrderPlaced";
    public int OrderId { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public string? CustomerId { get; init; }
    public decimal TotalAmount { get; init; }
    public string CurrencyCode { get; init; } = string.Empty;
    public int ReservationId { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; }
}
