using System.ComponentModel.DataAnnotations;
using ProductCatalog.Core.Entities;
using SharedKernel.Extensions;

namespace ProductCatalog.DTOs.Categories;

public class CreateCategoryRequest {
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    [MaxLength(200)]
    public string? ImageKey { get; set; } 
    public CategoryStatus Status { get; set; } = CategoryStatus.Active;
    public string? ParentName { get; set; }
    public string? Slug { 
        get => (field) ?? Name.ToSlug(); 
        set; 
    }
}