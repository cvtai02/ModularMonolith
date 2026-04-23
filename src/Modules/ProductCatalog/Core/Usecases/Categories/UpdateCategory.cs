using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Categories;
using SharedKernel.Exceptions;

namespace ProductCatalog.Core.Usecases.Categories;

public class UpdateCategory(ProductCatalogDbContext db)
{
    public async Task<CategoryResponse?> ExecuteAsync(string name, UpdateCategoryRequest request, CancellationToken ct)
    {
        var category = await db.Categories
            .Include(x => x.Parent)
            .FirstOrDefaultAsync(x => x.Name == name, ct);

        if (category is null) return null;

        var slug = request.Slug.Trim();
        var errors = new Dictionary<string, string[]>();

        if (!string.IsNullOrWhiteSpace(slug) && slug != category.Slug &&
            await db.Categories.AnyAsync(x => x.Slug == slug && x.Name != name, ct))
            errors[nameof(request.Slug)] = ["Slug already exists."];

        if (request.ParentName is not null &&
            request.ParentName != category.Parent?.Name &&
            !await db.Categories.AnyAsync(x => x.Name == request.ParentName, ct))
            errors[nameof(request.ParentName)] = ["Parent category does not exist."];

        if (errors.Count > 0) throw new ValidationException("Validation failed", errors);

        category.Description = request.Description.Trim();
        category.ImageUrl = request.ImageUrl.Trim();
        category.Status = request.Status;
        if (!string.IsNullOrWhiteSpace(slug)) category.Slug = slug;

        if (request.ParentName != category.Parent?.Name)
        {
            if (request.ParentName is null)
                category.ParentId = null;
            else
            {
                var parent = await db.Categories.FirstAsync(x => x.Name == request.ParentName.Trim(), ct);
                category.ParentId = parent.Id;
            }
        }

        await db.SaveChangesAsync(ct);
        return CategoryMapper.ToResponse(category);
    }
}
