namespace Inventory.Core.Entities;

public class ReservationLine : Entity
{
    public int Id { get; set; }
    public int ReservationId { get; set; }
    public string VariantId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public Reservation Reservation { get; set; } = null!;
    public VariantInventory Variant { get; set; } = null!;
}
