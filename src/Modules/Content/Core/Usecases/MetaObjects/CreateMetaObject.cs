using Content.Core.DTOs.MetaObjects;
using Content.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.MetaObjects;

public class CreateMetaObject(ContentDbContext db)
{
    public async Task<MetaObjectResponse> ExecuteAsync(CreateMetaObjectRequest request, CancellationToken ct)
    {
        var key = request.Key.Trim();
        if (await db.MetaObjects.AnyAsync(x => x.Key == key, ct))
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Key)] = ["Meta object already exists."]
            });

        var entity = new MetaObject
        {
            Key = key,
            Namespace = request.Namespace.Trim(),
            Value = request.Value.Trim(),
            Type = request.Type.Trim()
        };

        db.MetaObjects.Add(entity);
        await db.SaveChangesAsync(ct);

        return MetaObjectMapper.ToResponse(entity);
    }
}
