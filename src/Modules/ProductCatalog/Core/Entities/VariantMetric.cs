using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.Core.Entities;

public class VariantMetric : Entity
{
    [Key]
    public string VariantId { get; set; } = string.Empty;
    public int Stock { get; set; }
    public int Sold { get; set; }

    public float RatingAvg { get; set; }
    public int RatingCount { get; set; }
    public virtual Variant Variant { get; set; } = null!;
}
