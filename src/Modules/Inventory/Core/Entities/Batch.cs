namespace Inventory.Core.Entities;

public class Batch : AuditableEntity
{
    public int Id { get; set; }
    public int VariantId { get; set; }
    public int Quantity { get; set; }
    public DateTimeOffset ExpiryDate { get; set; }
    public VariantInventory Variant { get; set; } = null!;
}
