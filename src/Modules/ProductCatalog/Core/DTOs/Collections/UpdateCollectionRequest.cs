using System.ComponentModel.DataAnnotations;
namespace ProductCatalog.Core.DTOs.Collections;

public class UpdateCollectionRequest {
    [MaxLength(2000)] public string Description { get; set; } = string.Empty;
    [MaxLength(200)] public string Slug { get; set; } = string.Empty;
    [MaxLength(200)] public string? ImageKey { get; set; }
}
