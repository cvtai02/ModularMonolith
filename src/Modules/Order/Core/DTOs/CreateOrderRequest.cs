using System.ComponentModel.DataAnnotations;

namespace Order.Core.DTOs;

public class CreateOrderRequest
{
    public string? CustomerId { get; set; }

    [MaxLength(3)]
    public string CurrencyCode { get; set; } = "USD";

    public List<CreateOrderLineRequest> Lines { get; set; } = [];
}

public class CreateOrderLineRequest
{
    [Required]
    public int VariantId { get; set; }

    [Required, MaxLength(256)]
    public string ProductName { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal UnitPrice { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}
