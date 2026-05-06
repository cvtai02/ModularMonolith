namespace ProductCatalog.Core.Entities;  
public class CollectionProduct : AuditableEntity
{
    public CollectionProduct()
    {
        IsSoftDeleted = false;
    }

    public int Id { get; set; }
    public int CollectionId { get; set; }
    public string ProductId { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public virtual Collection Collection { get; set; } = null!; //virtual to enable lazy load
    public Product Product { get; set; } = null!;
}
