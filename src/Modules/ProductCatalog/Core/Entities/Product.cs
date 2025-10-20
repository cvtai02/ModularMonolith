namespace ProductCatalog.Core.Entities;

public class Product : AuditableEntity, IReferTenantEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string Slug { get; set; } = null!;
    public string ImageUrl { get; set; } = string.Empty;
    public ProductStatus Status { get; set; } = ProductStatus.Active;
    
    public Category Category { get; set; } = null!;
    public List<ProductMedia> Medias { get; set; } = [];
    public List<Option> Options { get; set; } = [];
    public ProductMetric Metric { get; set; } = null!;
    public ProductInventory Inventory { get; set; } = null!;
}


public enum ProductStatus
{
    Active,
    Draft,
    Unlisted,
    Deleted
}
