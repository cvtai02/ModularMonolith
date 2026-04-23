namespace ProductCatalog.Core.Entities;  
public class CollectionProduct : AuditableEntity
{
    public int Id { get; set; }
    public int CollectionId { get; set; }
    public int ProductId { get; set; }
    public int DisplayOrder { get; set; }
    public virtual Collection Collection { get; set; } = null!; //virtual to enable lazy load
    public Product Product { get; set; } = null!;
}