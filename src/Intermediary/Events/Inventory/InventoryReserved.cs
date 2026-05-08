using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Inventory;

public class InventoryReserved : IntegrationEvent
{
    public string OrderCode { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; init; }
    public IReadOnlyCollection<InventoryReservationItem> Items { get; init; } = [];
}

public class InventoryReservationItem
{
    public string VariantId { get; init; } = string.Empty;
    public int Quantity { get; init; }
}
