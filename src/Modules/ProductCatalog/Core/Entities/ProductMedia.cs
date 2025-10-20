namespace ProductCatalog.Core.Entities;

public class ProductMedia : Entity, IReferTenantEntity
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Url { get; set; } = null!;
    public string Type { get; set; } = null!;
    public float DisplayOrder { get; set; }
    public virtual Product Product { get; set; } = null!;
}