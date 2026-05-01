using SharedKernel.Enums;

namespace ProductCatalog.Core.Entities;

public class Variant : AuditableEntity
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ImageKey { get; set; }   // if null use product image.

    // Pricing
    public bool UseProductPricing { get; private set; } = true;
    public decimal Price { get; private set; }
    public decimal? CompareAtPrice { get; private set; }
    public decimal CostPrice { get; private set; }
    public bool ChargeTax { get; private set; } = false;

    public void ApplyProductPricing(Product p)
    {
        UseProductPricing = true;
        Price = p.Price;
        CompareAtPrice = p.CompareAtPrice;
        CostPrice = p.CostPrice;
        ChargeTax = p.ChargeTax;
    }

    public void ApplyVariantPricing(
        decimal price,
        decimal? compareAtPrice,
        decimal costPrice,
        bool chargeTax)
    {
        UseProductPricing = false;
        Price = price;
        CompareAtPrice = compareAtPrice.HasValue && compareAtPrice.Value >= price ? compareAtPrice : null;
        CostPrice = costPrice;
        ChargeTax = chargeTax;
    }

    // Inventory
    public bool TrackInventory { get; private set; } = true;
    public bool AllowBackorder { get; private set; }
    public void SetInventoryPolicy(bool trackInventory, bool allowBackorder)
    {
        TrackInventory = trackInventory;
        AllowBackorder = trackInventory && allowBackorder;
    }

    public Product Product { get; set; } = null!;
    public VariantMetric? Metric { get; set; }
    public VariantShipping? ShippingInfo { get; set; }
    public virtual ICollection<VariantOptionValue> OptionValues { get; set; } = [];
}
