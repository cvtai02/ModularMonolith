using ProductCatalog.Core.DTOs.Categories;
using ProductCatalog.Core.Entities;

namespace ProductCatalog.Core.Usecases.Categories;

internal static class CategoryMapper
{
    internal static CategoryResponse ToResponse(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Description = c.Description,
        ImageUrl = c.ImageUrl,
        Status = c.Status,
        ParentName = c.Parent?.Name,
        Slug = c.Slug,
    };
}
