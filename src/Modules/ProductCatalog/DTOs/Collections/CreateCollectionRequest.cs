using System.ComponentModel.DataAnnotations;
namespace ProductCatalog.DTOs.Collections;

public class CreateCollectionRequest {
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(2000)] public string Description { get; set; } = string.Empty;
    [MaxLength(200)] public string Slug { get; set; } = string.Empty;
    [MaxLength(200)] public string? ImageKey { get; set; }
    public List<int> ProductIds { get; set; } = [];
}
