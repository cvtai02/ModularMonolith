using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Order;

public class AdminOrderPlaced : IntegrationEvent
{
    public int OrderId { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public string? CustomerId { get; init; }
    public decimal TotalAmount { get; init; }
    public string CurrencyCode { get; init; } = string.Empty;
    public int ReservationId { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; }
}
