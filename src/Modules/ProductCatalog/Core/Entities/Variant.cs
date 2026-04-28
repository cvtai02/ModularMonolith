using SharedKernel.Enums;

namespace ProductCatalog.Core.Entities;

public class Variant : AuditableEntity
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ImageKey { get; set; }

    // Pricing
    public bool UseProductPricing { get; set; } = true;
    public decimal Price { get; set; }
    public Currency Currency { get; set; }
    public decimal CompareAtPrice { get; set; }
    public decimal CostPrice { get; set; }
    public bool ChargeTax { get; set; }

    // Inventory
    public bool TrackInventory { get; set; } = true;
    public bool AllowBackorder { get; set; }

    public Product Product { get; set; } = null!;
    public VariantMetric? Metric { get; set; }
    public VariantShipping? ShippingInfo { get; set; }
    public virtual ICollection<VariantOptionValue> OptionValues { get; set; } = [];
}
