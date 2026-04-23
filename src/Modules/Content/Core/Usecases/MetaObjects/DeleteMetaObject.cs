using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.MetaObjects;

public class DeleteMetaObject(ContentDbContext db)
{
    public async Task<bool> ExecuteAsync(string key, CancellationToken ct)
    {
        var entity = await db.MetaObjects.FirstOrDefaultAsync(x => x.Key == key, ct);
        if (entity is null) return false;

        db.MetaObjects.Remove(entity);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
