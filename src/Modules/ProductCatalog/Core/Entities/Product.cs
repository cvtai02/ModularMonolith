using SharedKernel.Enums;

namespace ProductCatalog.Core.Entities;

public class Product : AuditableEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Slug { get; set; } = null!;
    public string Brand { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    // Pricing
    public decimal Price { get; set; }
    public Currency Currency { get; set; }
    public decimal CompareAtPrice { get; set; }
    public decimal CostPrice { get; set; }
    public bool ChargeTax { get; set; }

    // Inventory defaults
    public bool TrackInventory { get; set; } = true;
    public bool AllowBackorder { get; set; }

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
