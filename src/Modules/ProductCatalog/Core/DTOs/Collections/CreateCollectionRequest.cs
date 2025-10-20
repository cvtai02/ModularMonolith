using System.ComponentModel.DataAnnotations;
namespace ProductCatalog.Core.DTOs.Collections;

public class CreateCollectionRequest {
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(2000)] public string Description { get; set; } = string.Empty;
    [MaxLength(200)] public string Slug { get; set; } = string.Empty;
    [MaxLength(200)] public string Image { get; set; } = string.Empty;
}
