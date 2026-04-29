using ProductCatalog.Core.DTOs.Collections;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Collections;

internal static class CollectionMapper
{
    internal static CollectionResponse ToResponse(Collection c, IFileManager fm) => new()
    {
        Id = c.Id,
        Title = c.Title,
        Description = c.Description,
        Slug = c.Slug,
        ImageUrl = fm.BuildPublicUrl(c.ImageKey),
    };
}
