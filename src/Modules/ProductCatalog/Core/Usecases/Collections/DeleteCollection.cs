using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace ProductCatalog.Core.Usecases.Collections;

public class DeleteCollection(ProductCatalogDbContext db)
{
    public async Task<bool> ExecuteAsync(int id, CancellationToken ct)
    {
        var collection = await db.Collections.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (collection is null) return false;

        if (await db.CollectionProducts.AnyAsync(x => x.CollectionId == collection.Id, ct))
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(id)] = ["Collection has products and cannot be deleted."]
            });

        db.Collections.Remove(collection);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
