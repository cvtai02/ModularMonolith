namespace Order.Core.Notifications;

public class OrderPlacedNotification
{
    public string OrderCode { get; init; } = string.Empty;
    public int ReservationId { get; init; }
    public string Status { get; init; } = string.Empty;
}
