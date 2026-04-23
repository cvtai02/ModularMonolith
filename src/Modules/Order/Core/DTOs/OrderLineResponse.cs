namespace Order.Core.DTOs;

public class OrderLineResponse
{
    public int Id { get; set; }
    public int VariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}
