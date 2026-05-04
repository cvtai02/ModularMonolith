namespace Order.Core.Notifications;

public class OrderNotification
{
    public string Type { get; init; } = string.Empty;
    public int OrderId { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public int? ReservationId { get; init; }
    public string? RejectionReason { get; init; }
    public DateTimeOffset OccurredAt { get; init; } = DateTimeOffset.UtcNow;
}
