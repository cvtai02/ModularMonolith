using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.Core.Entities;


public class VariantShipping : AuditableEntity
{
    [Key] 
    public int VariantId { get; set; }
    public float Weight { get; set; }   // in kg
    public float Width { get; set; }    // in cm
    public float Height { get; set; }   // in cm
    public float Length { get; set; }   // in cm
    public bool Physical { get; set; } = true;
    public bool UseProductShipping { get; set; } = true;
    public virtual Variant Variant { get; set; } = null!;
}