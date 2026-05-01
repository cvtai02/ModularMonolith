using Microsoft.EntityFrameworkCore;
using ProductCatalog.DTOs.Categories;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.Usecases.Categories;

public class CreateCategory(ProductCatalogDbContext db, IFileManager fm)
{
    public async Task<CategoryResponse> ExecuteAsync(CreateCategoryRequest request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? name.ToSlug() : request.Slug.Trim();
        var parentName = string.IsNullOrWhiteSpace(request.ParentName) ? null : request.ParentName.Trim();

        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(name))
            errors[nameof(request.Name)] = ["Category name is required."];

        if (await db.Categories.AnyAsync(x => x.Name == name, ct))
            errors[nameof(request.Name)] = ["A category with this name already exists."];

        if (await db.Categories.AnyAsync(x => x.Slug == slug, ct))
            errors[nameof(request.Slug)] = ["Slug already exists."];

        if (parentName is not null && !await db.Categories.AnyAsync(x => x.Name == parentName, ct))
            errors[nameof(request.ParentName)] = ["Parent category does not exist."];

        if (errors.Count > 0) throw new ValidationException("Validation failed", errors);

        int? parentId = null;
        if (parentName is not null)
        {
            var parent = await db.Categories.FirstAsync(x => x.Name == parentName, ct);
            parentId = parent.Id;
        }

        var category = new Category
        {
            Name = name,
            Description = request.Description.Trim(),
            ImageKey = request.ImageKey?.Trim(),
            Status = request.Status,
            ParentId = parentId,
            Slug = slug,
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync(ct);

        return CategoryMapper.ToResponse(category, fm);
    }
}
