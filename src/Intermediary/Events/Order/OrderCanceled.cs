using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Order;

public class OrderCanceled : IntegrationEvent
{
    public string OrderCode { get; init; } = string.Empty;
    public int? ReservationId { get; set; }
}
