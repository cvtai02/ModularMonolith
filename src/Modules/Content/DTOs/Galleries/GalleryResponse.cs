namespace Content.DTOs.Galleries;

public class GalleryResponse
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public List<GalleryItemResponse> Items { get; set; } = [];
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }
}

public class GallerySummaryResponse
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public int ItemCount { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }
}

public class GalleryItemResponse
{
    public int Id { get; set; }
    public string ImageKey { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
}
