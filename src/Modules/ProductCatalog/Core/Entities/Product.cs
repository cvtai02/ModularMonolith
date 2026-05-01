using SharedKernel.Enums;

namespace ProductCatalog.Core.Entities;

public class Product : AuditableEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;

    // Pricing
    public decimal Price { get; private set; }
    public Currency Currency { get; private set; }
    public decimal CompareAtPrice { get; private set; }
    public decimal CostPrice { get; private set; }
    public bool ChargeTax { get; private set; }

    public void ApplyPricing(
        decimal price,
        Currency currency,
        decimal compareAtPrice,
        decimal costPrice,
        bool chargeTax)
    {
        Price = price;
        Currency = currency;
        CompareAtPrice = compareAtPrice >= price ? compareAtPrice : 0;
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

    public ProductStatus Status { get; set; } = ProductStatus.Active;
    
    public Category Category { get; set; } = null!;
    public ProductShipping? ShippingInfo { get; set; }
    public List<ProductMedia> Medias { get; set; } = [];
    public List<Option> Options { get; set; } = [];
    public List<Variant> Variants { get; set; } = [];
    public ProductMetric Metric { get; set; } = null!;
}


public enum ProductStatus
{
    Active,
    Draft,
    Unlisted,
}
