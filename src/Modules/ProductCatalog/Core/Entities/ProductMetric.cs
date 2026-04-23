using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.Core.Entities;

public class ProductMetric : Entity
{
    [Key]
    public int ProductId { get; set; }

    // Analytics
    public float RatingAvg { get; set; }
    public int RatingCount { get; set; }
    public int ViewCount { get; set; }

    public int Stock { get; set; }
    public int Sold { get; set; }

    public virtual Product Product { get; set; } = null!;
}
