using Microsoft.EntityFrameworkCore;

namespace ProductCatalog.Core.Usecases.Collections;

public class DeleteCollection(ProductCatalogDbContext db)
{
    public async Task<bool> ExecuteAsync(int id, CancellationToken ct)
    {
        var collection = await db.Collections.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (collection is null) return false;

        db.Collections.Remove(collection);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
