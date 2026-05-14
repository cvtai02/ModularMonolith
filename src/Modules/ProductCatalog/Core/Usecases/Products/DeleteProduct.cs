using Microsoft.EntityFrameworkCore;

namespace ProductCatalog.Core.Usecases.Products;

[UsecaseInject]
public class DeleteProduct(ProductCatalogDbContext db)
{
    public async Task<bool> ExecuteAsync(string id, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(id))
            return false;

        var product = await db.Products.FirstOrDefaultAsync(x => x.Id == id.Trim(), ct);
        if (product is null)
            return false;

        db.Products.Remove(product);
        await db.SaveChangesAsync(ct);
        return true;
    }
}

