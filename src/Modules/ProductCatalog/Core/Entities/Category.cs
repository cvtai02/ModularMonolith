using System.ComponentModel.DataAnnotations;
namespace ProductCatalog.Core.Entities;

public class Category : AuditableEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public CategoryStatus Status { get; set; } = CategoryStatus.Active;
    
    public Category? Parent { get; set; }
    public ICollection<Category> Subcategories { get; set; } = [];
    public ICollection<Product> Products { get; set; } = [];
}

public enum CategoryStatus
{
    Active,
    Inactive,
}
