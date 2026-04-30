using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Inventory;

public class ReservationExpired : IntegrationEvent
{
    public int OrderId { get; init; }
    public int ReservationId { get; init; }
}
