using System.ComponentModel.DataAnnotations;
using ProductCatalog.Core.Entities;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.DTOs.Categories;

public class CategoryResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public CategoryStatus Status { get; set; } = CategoryStatus.Active;
    public string? ParentName { get; set; }
    public string Slug { get; set; } = null!;
}
