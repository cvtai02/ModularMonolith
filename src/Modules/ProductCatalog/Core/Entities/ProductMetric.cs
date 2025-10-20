using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.Core.Entities;

public class ProductMetric : Entity, IReferTenantEntity
{
    [Key]
    public int ProductId { get; set; }
    public decimal Price { get; set; }
    public decimal CompareAtPrice { get; set; }
    // public decimal UnitPrice { get; set; }
    public decimal CostPrice { get; set; }
    public bool ChargeTax { get; set; }
    public int Stock { get; set; }
    public int Sold { get; set; }
    public float RatingAvg { get; set; }
    public int RatingCount { get; set; }
    public int ViewCount { get; set; }
    public virtual Product Product { get; set; } = null!;
}
 