using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Inventory;

public class InventoryReserved : IntegrationEvent
{
    public int OrderId { get; init; }
    public int ReservationId { get; init; }
    public DateTimeOffset ExpiresAt { get; init; }
    public IReadOnlyCollection<InventoryReservationItem> Items { get; init; } = [];
}

public class InventoryReservationItem
{
    public int VariantId { get; init; }
    public int Quantity { get; init; }
}
