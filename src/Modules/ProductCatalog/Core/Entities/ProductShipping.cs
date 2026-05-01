using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.Core.Entities;

public class ProductShipping : AuditableEntity
{
    [Key]
    public int ProductId { get; set; }
    public float Weight { get; private set; }   // in kg
    public float Width { get; private set; }    // in cm
    public float Height { get; private set; }   // in cm
    public float Length { get; private set; }   // in cm
    public bool Physical { get; private set; } = true;
    public virtual Product Product { get; set; } = null!;

    public void ApplyShipping(bool physical, float weight, float width, float height, float length)
    {
        Physical = physical;

        if (!physical)
        {
            Weight = 0;
            Width = 0;
            Height = 0;
            Length = 0;
            return;
        }

        Weight = weight;
        Width = width;
        Height = height;
        Length = length;
    }
}
