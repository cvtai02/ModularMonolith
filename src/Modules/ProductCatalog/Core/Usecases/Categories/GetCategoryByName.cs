using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Categories;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Categories;

public class GetCategoryByName(ProductCatalogDbContext db, IFileManager fm)
{
    public async Task<CategoryResponse?> ExecuteAsync(string name, CancellationToken ct)
    {
        var category = await db.Categories
            .AsNoTracking()
            .Include(x => x.Parent)
            .FirstOrDefaultAsync(x => x.Name == name, ct);

        return category is null ? null : CategoryMapper.ToResponse(category, fm);
    }
}
