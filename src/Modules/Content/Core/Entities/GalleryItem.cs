namespace Content.Core.Entities;

public class GalleryItem : AuditableEntity
{
    public int Id { get; set; }
    public int GalleryId { get; set; }
    public Gallery Gallery { get; set; } = null!;
    public string ImageKey { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
}
