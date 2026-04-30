using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace ProductCatalog.Core.Usecases.Categories;

public class DeleteCategory(ProductCatalogDbContext db)
{
    public async Task<bool> ExecuteAsync(string name, CancellationToken ct)
    {
        var category = await db.Categories.FirstOrDefaultAsync(x => x.Name == name, ct);
        if (category is null) return false;

        var errors = new Dictionary<string, string[]>();

        var categoryErrors = new List<string>();

        if (await db.Categories.AnyAsync(x => x.ParentId == category.Id, ct))
            categoryErrors.Add("Category has child categories and cannot be deleted.");

        if (await db.Products.AnyAsync(x => x.CategoryId == category.Id, ct))
            categoryErrors.Add("Category is used by products and cannot be deleted.");

        if (categoryErrors.Count > 0)
            errors[nameof(name)] = categoryErrors.ToArray();

        if (errors.Count > 0) throw new ValidationException("Validation failed", errors);

        db.Categories.Remove(category);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
