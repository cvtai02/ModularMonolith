namespace Content.Core.Entities;

public class BlogPostCollection : AuditableEntity
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; } = true;
    public ICollection<BlogPostCollectionItem> Items { get; set; } = [];
}
