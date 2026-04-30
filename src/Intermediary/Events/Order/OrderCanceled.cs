using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Order;

public class OrderCanceled : IntegrationEvent
{
    public int OrderId { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public int? ReservationId { get; init; }
}
