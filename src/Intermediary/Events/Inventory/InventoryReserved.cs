using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Inventory;

public class InventoryReserved : IntegrationEvent
{
    public string OrderCode { get; set; } = string.Empty;
    public int ReservationId { get; set; }
    public DateTimeOffset ExpiresAt { get; init; }
    public IReadOnlyCollection<InventoryReservationItem> Items { get; init; } = [];
}

public class InventoryReservationItem
{
    public int VariantId { get; init; }
    public int Quantity { get; init; }
}
