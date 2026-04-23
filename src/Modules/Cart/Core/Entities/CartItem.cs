namespace Cart.Core.Entities;

public class CartItem : AuditableEntity
{
    public int Id { get; set; }
    public int CartId { get; set; }
    public int VariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPriceSnapshot { get; set; }
    public int Quantity { get; set; }
    public Cart Cart { get; set; } = null!;
}
