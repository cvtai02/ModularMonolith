using Content.Core.DTOs.MetaObjects;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.MetaObjects;

public class UpdateMetaObject(ContentDbContext db)
{
    public async Task<MetaObjectResponse?> ExecuteAsync(string key, UpdateMetaObjectRequest request, CancellationToken ct)
    {
        var entity = await db.MetaObjects.FirstOrDefaultAsync(x => x.Key == key, ct);
        if (entity is null) return null;

        entity.Namespace = request.Namespace.Trim();
        entity.Value = request.Value.Trim();
        entity.Type = request.Type.Trim();
        await db.SaveChangesAsync(ct);

        return MetaObjectMapper.ToResponse(entity);
    }
}
