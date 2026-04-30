using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Order;

public class OrderPlaced : IntegrationEvent
{
    public int OrderId { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public int ReservationId { get; init; }
}
