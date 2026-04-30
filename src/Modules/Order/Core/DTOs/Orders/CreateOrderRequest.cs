using System.ComponentModel.DataAnnotations;
using SharedKernel.DTOs;

namespace Order.Core.DTOs.Orders;

public class CreateOrderRequest
{
    [MaxLength(3)]
    public string? CurrencyCode { get; set; }

    [Required]
    public Address ShippingAddress { get; set; } = new();

    public List<CreateOrderItemRequest> Items { get; set; } = [];
}

public class CreateOrderItemRequest
{
    public int VariantId { get; set; }
    public int Quantity { get; set; }
}
