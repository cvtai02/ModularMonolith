using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Categories;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Categories;

internal static class CustomerCategoryMapper
{
    internal static CustomerCategoryResponse ToResponse(Category category, IFileManager fileManager) => new()
    {
        Id = category.Id,
        Name = category.Name,
        Description = category.Description,
        ImageUrl = string.IsNullOrWhiteSpace(category.ImageKey) ? null : fileManager.BuildPublicUrl(category.ImageKey),
        ParentName = category.Parent?.Name,
        Slug = category.Slug
    };
}
