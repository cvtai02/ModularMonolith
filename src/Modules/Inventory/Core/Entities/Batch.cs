namespace Inventory.Core.Entities;

public class Batch : AuditableEntity
{
    public int Id { get; set; }
    public string VariantId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTimeOffset ExpiryDate { get; set; }
    public VariantInventory Variant { get; set; } = null!;
}
