using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Inventory;

public class ReservationCommited : IntegrationEvent
{
    public string OrderCode { get; set; } = string.Empty;
    public int ReservationId { get; set; }
    public IReadOnlyCollection<InventoryReservationItem> Items { get; init; } = [];
}
