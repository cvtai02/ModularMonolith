namespace Inventory.Core.Entities;

public class Reservation : AuditableEntity
{
    public int Id { get; set; }
    public int VariantId { get; set; }
    public int OrderId { get; set; }
    public int Quantity { get; set; }
    public ReservationStatus Status { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public VariantInventory Variant { get; set; } = null!;
}

public enum ReservationStatus
{
    Active,
    Released,
    Confirmed
}
