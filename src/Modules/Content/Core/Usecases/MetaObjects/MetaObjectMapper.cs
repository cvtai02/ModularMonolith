using Content.Core.DTOs.MetaObjects;
using Content.Core.Entities;

namespace Content.Core.Usecases.MetaObjects;

internal static class MetaObjectMapper
{
    internal static MetaObjectResponse ToResponse(MetaObject m) => new()
    {
        Key = m.Key,
        Namespace = m.Namespace,
        Value = m.Value,
        Type = m.Type
    };
}
