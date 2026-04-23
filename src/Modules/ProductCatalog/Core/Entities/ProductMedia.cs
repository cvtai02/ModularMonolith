namespace ProductCatalog.Core.Entities;

public class ProductMedia : AuditableEntity
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Key { get; set; } = null!;    // Strorage key for the media file
    public float DisplayOrder { get; set; }
    public virtual Product Product { get; set; } = null!;
}