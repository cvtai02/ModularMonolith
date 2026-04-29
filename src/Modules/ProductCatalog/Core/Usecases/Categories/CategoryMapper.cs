using ProductCatalog.Core.DTOs.Categories;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Categories;

internal static class CategoryMapper
{
    internal static CategoryResponse ToResponse(Category c, IFileManager f) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Description = c.Description,
        ImageUrl = f.BuildPublicUrl(c.ImageKey),
        Status = c.Status,
        ParentName = c.Parent?.Name,
        Slug = c.Slug,
    };
}
