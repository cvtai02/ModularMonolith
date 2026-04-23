using Content.Core.DTOs.MetaObjects;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.MetaObjects;

public class GetMetaObjectByKey(ContentDbContext db)
{
    public async Task<MetaObjectResponse?> ExecuteAsync(string key, CancellationToken ct)
    {
        var item = await db.MetaObjects
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Key == key, ct);

        return item is null ? null : MetaObjectMapper.ToResponse(item);
    }
}
