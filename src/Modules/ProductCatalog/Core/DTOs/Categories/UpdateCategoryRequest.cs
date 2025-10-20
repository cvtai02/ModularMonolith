using System.ComponentModel.DataAnnotations;
using ProductCatalog.Core.Entities;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.DTOs.Categories;

public class UpdateCategoryRequest {
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    [MaxLength(200)]
    public string ImageUrl { get; set; } = string.Empty;
    public CategoryStatus Status { get; set; } = CategoryStatus.Active;
    public string? ParentName { get; set; }
    public string Slug { get; set; } = string.Empty;
}
