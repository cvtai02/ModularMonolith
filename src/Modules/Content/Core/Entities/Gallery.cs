namespace Content.Core.Entities;

public class Gallery : AuditableEntity
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public bool IsPublic { get; set; } = true;
    public ICollection<GalleryItem> Items { get; set; } = [];
}
