using ProductCatalog.Core.DTOs.Collections;
using ProductCatalog.Core.Entities;

namespace ProductCatalog.Core.Usecases.Collections;

internal static class CollectionMapper
{
    internal static CollectionResponse ToResponse(Collection c) => new()
    {
        Id = c.Id,
        Title = c.Title,
        Description = c.Description,
        Slug = c.Slug,
        Image = c.Image,
    };
}
