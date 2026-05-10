using Content.Core.Entities;
using Content.DTOs.Galleries;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.Galleries;

[UsecaseInject]
public class CreateGallery(ContentDbContext db)
{
    public async Task<GalleryResponse> ExecuteAsync(CreateGalleryRequest request, CancellationToken ct)
    {
        GalleryValidation.Validate(request);

        var key = GalleryValidation.NormalizeKey(request.Key);
        var exists = await db.Galleries
            .ActiveOnly()
            .AnyAsync(x => x.Key == key, ct);

        if (exists)
            GalleryValidation.Throw("Key", "A gallery with this key already exists.");

        var gallery = new Gallery
        {
            Key = key,
            Name = GalleryValidation.NormalizeRequired(request.Name),
            Note = GalleryValidation.NormalizeOptional(request.Note),
            IsPublic = request.IsPublic,
            Items = BuildItems(request.Items)
        };

        db.Galleries.Add(gallery);
        await db.SaveChangesAsync(ct);
        return GalleryMapper.ToResponse(gallery);
    }

    private static List<GalleryItem> BuildItems(List<SaveGalleryItemRequest> items)
        => items
            .OrderBy(x => x.DisplayOrder)
            .Select((item, index) => new GalleryItem
            {
                ImageKey = GalleryValidation.NormalizeRequired(item.ImageKey),
                DisplayOrder = item.DisplayOrder <= 0 ? index + 1 : item.DisplayOrder,
                Name = GalleryValidation.NormalizeOptional(item.Name),
                Note = GalleryValidation.NormalizeOptional(item.Note),
                Link = GalleryValidation.NormalizeOptional(item.Link)
            })
            .ToList();
}
