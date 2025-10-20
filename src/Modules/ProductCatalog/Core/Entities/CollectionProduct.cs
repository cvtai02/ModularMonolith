using Microsoft.EntityFrameworkCore;

namespace ProductCatalog.Core.Entities;  

[PrimaryKey(nameof(CollectionTitle), nameof(ProductId))]
public class CollectionProduct : AuditableEntity
{
    public string CollectionTitle { get; set; } = null!;
    public int ProductId { get; set; }
    public virtual Collection Collection { get; set; } = null!; //virtual to enable lazy load
    public Product Product { get; set; } = null!;
}