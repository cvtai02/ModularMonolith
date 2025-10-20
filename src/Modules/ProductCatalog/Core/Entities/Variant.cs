namespace ProductCatalog.Core.Entities;

public class Variant : AuditableEntity, IReferTenantEntity
{
    public int Id {get; set;}
    public int ProductId { get; set; }
    public decimal Price { get; set; }
    public Product Product { get; set; } = null!;
    public virtual ICollection<VariantOptionValue> OptionValues { get; set; } = [];
}

