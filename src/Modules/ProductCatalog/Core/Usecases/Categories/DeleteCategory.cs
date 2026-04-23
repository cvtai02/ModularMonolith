using Microsoft.EntityFrameworkCore;

namespace ProductCatalog.Core.Usecases.Categories;

public class DeleteCategory(ProductCatalogDbContext db)
{
    public async Task<bool> ExecuteAsync(string name, CancellationToken ct)
    {
        var category = await db.Categories.FirstOrDefaultAsync(x => x.Name == name, ct);
        if (category is null) return false;

        db.Categories.Remove(category);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
