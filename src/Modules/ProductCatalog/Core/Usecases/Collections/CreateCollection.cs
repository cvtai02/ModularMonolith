using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Collections;
using ProductCatalog.Core.Entities;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.Usecases.Collections;

public class CreateCollection(ProductCatalogDbContext db)
{
    public async Task<CollectionResponse> ExecuteAsync(CreateCollectionRequest request, CancellationToken ct)
    {
        var title = request.Title.Trim();
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? title.ToSlug() : request.Slug.Trim();

        if (await db.Collections.AnyAsync(x => x.Slug == slug, ct))
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Slug)] = ["Slug already exists."]
            });

        var collection = new Collection
        {
            Title = title,
            Description = request.Description.Trim(),
            Slug = slug,
            Image = request.Image.Trim(),
        };

        db.Collections.Add(collection);
        await db.SaveChangesAsync(ct);

        return CollectionMapper.ToResponse(collection);
    }
}
