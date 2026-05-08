using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.Core.Entities;

public class ProductMetric : Entity
{
    [Key]
    public string ProductId { get; set; } = string.Empty;

    // Analytics
    public float RatingAvg { get; set; }
    public int RatingCount { get; set; }
    public int ViewCount { get; set; }

    public int Stock { get; set; }
    public int Sold { get; set; }
    public decimal LowestPrice { get; set; }
    public decimal HighestPrice { get; set; }

    public virtual Product Product { get; set; } = null!;
}
