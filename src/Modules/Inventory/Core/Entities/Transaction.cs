namespace Inventory.Core.Entities;

public class Transaction : AuditableEntity
{
    public int Id { get; set; }
    public int VariantId { get; set; }
    public TransactionType Type { get; set; }
    public int Quantity { get; set; }
    public string? ReferenceId { get; set; }
    public string? Note { get; set; }
    public VariantInventory Variant  { get; set; } = null!;
}

public enum TransactionType
{
    In,
    Out,
    Reserve,
    Release,
    Adjust
}
