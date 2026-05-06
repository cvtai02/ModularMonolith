using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Inventory;

public class ReservationExpired : IntegrationEvent
{
    public string OrderCode { get; set; } = string.Empty;
    public int ReservationId { get; set; }
}
