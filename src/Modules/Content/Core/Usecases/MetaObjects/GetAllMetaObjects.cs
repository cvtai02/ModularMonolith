using Content.Core.DTOs.MetaObjects;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.MetaObjects;

public class GetAllMetaObjects(ContentDbContext db)
{
    public async Task<List<MetaObjectResponse>> ExecuteAsync(CancellationToken ct)
    {
        var items = await db.MetaObjects
            .AsNoTracking()
            .OrderBy(x => x.Namespace)
            .ThenBy(x => x.Key)
            .ToListAsync(ct);

        return items.Select(MetaObjectMapper.ToResponse).ToList();
    }
}
