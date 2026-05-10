using System.ComponentModel.DataAnnotations;

namespace Content.DTOs.Galleries;

public class CreateGalleryRequest
{
    [Required]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Note { get; set; }

    public bool IsPublic { get; set; } = true;
    public List<SaveGalleryItemRequest> Items { get; set; } = [];
}

public class UpdateGalleryRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Note { get; set; }

    public bool IsPublic { get; set; } = true;
    public List<SaveGalleryItemRequest> Items { get; set; } = [];
}

public class SaveGalleryItemRequest
{
    [Required]
    [MaxLength(2000)]
    public string ImageKey { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    [MaxLength(200)]
    public string? Name { get; set; }

    [MaxLength(2000)]
    public string? Note { get; set; }

    [MaxLength(2000)]
    public string? Link { get; set; }
}
