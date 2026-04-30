using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Categories;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace ProductCatalog.Core.Usecases.Categories;

public class UpdateCategory(ProductCatalogDbContext db, IFileManager fm)
{
    public async Task<CategoryResponse?> ExecuteAsync(string name, UpdateCategoryRequest request, CancellationToken ct)
    {
        var category = await db.Categories
            .Include(x => x.Parent)
            .FirstOrDefaultAsync(x => x.Name == name, ct);

        if (category is null) return null;

        var slug = request.Slug.Trim();
        var parentName = string.IsNullOrWhiteSpace(request.ParentName) ? null : request.ParentName.Trim();
        var errors = new Dictionary<string, string[]>();

        if (!string.IsNullOrWhiteSpace(slug) && slug != category.Slug &&
            await db.Categories.AnyAsync(x => x.Slug == slug && x.Name != name, ct))
            errors[nameof(request.Slug)] = ["Slug already exists."];

        Category? parent = null;
        if (parentName is not null && parentName != category.Parent?.Name)
        {
            parent = await db.Categories.FirstOrDefaultAsync(x => x.Name == parentName, ct);
            if (parent is null)
                errors[nameof(request.ParentName)] = ["Parent category does not exist."];
            else if (parent.Id == category.Id || await WouldCreateCycleAsync(category.Id, parent.Id, ct))
                errors[nameof(request.ParentName)] = ["Parent category cannot be the category itself or one of its descendants."];
        }

        if (errors.Count > 0) throw new ValidationException("Validation failed", errors);

        category.Description = request.Description.Trim();
        category.ImageKey = request.ImageKey?.Trim();
        category.Status = request.Status;
        if (!string.IsNullOrWhiteSpace(slug)) category.Slug = slug;

        if (parentName != category.Parent?.Name)
        {
            if (parentName is null)
                category.ParentId = null;
            else
                category.ParentId = parent!.Id;
        }

        await db.SaveChangesAsync(ct);
        return CategoryMapper.ToResponse(category, fm);
    }

    private async Task<bool> WouldCreateCycleAsync(int categoryId, int parentId, CancellationToken ct)
    {
        var parents = await db.Categories
            .AsNoTracking()
            .Select(x => new { x.Id, x.ParentId })
            .ToListAsync(ct);

        var currentParentId = parentId;
        var visited = new HashSet<int>();
        while (true)
        {
            if (currentParentId == categoryId) return true;
            if (!visited.Add(currentParentId)) return true;

            var next = parents.FirstOrDefault(x => x.Id == currentParentId)?.ParentId;
            if (next is null) return false;

            currentParentId = next.Value;
        }
    }
}
