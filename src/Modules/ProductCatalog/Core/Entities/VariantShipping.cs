using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.Core.Entities;


public class VariantShipping : AuditableEntity
{
    [Key] 
    public int VariantId { get; set; }
    public float Weight { get; private set; }   // in kg
    public float Width { get; private set; }    // in cm
    public float Height { get; private set; }   // in cm
    public float Length { get; private set; }   // in cm
    public bool Physical { get; private set; } = true;
    public bool UseProductShipping { get; private set; } = true;
    public virtual Variant Variant { get; set; } = null!;

    public void ApplyProductShipping(ProductShipping p)
    {
        UseProductShipping = true;
        Weight = p.Weight;
        Width = p.Width;
        Height = p.Height;
        Length = p.Length;
        Physical = p.Physical;
    }

    public void ApplyVariantShipping(bool physical, float weight, float width, float height, float length)
    {
        UseProductShipping = false;
        Weight = weight;
        Width = width;
        Height = height;
        Length = length;
        Physical = physical;
        if(!physical)
        {
            Weight = 0;
            Height = 0;
            Width = 0;
            Length = 0;
        }
    }
}
