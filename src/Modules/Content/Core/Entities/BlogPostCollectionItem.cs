namespace Content.Core.Entities;

public class BlogPostCollectionItem : AuditableEntity
{
    public int Id { get; set; }
    public int BlogPostCollectionId { get; set; }
    public BlogPostCollection BlogPostCollection { get; set; } = null!;
    public int BlogPostId { get; set; }
    public BlogPost BlogPost { get; set; } = null!;
    public int DisplayOrder { get; set; }
}
