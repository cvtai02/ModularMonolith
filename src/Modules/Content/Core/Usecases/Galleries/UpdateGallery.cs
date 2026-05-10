using Content.Core.Entities;
using Content.DTOs.Galleries;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.Galleries;

[UsecaseInject]
public class UpdateGallery(ContentDbContext db)
{
    public async Task<GalleryResponse?> ExecuteAsync(int id, UpdateGalleryRequest request, CancellationToken ct)
    {
        GalleryValidation.Validate(request);

        var gallery = await db.Galleries
            .ActiveOnly()
            .Include(x => x.Items.Where(i => !i.IsDeleted))
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (gallery is null)
            return null;

        gallery.Name = GalleryValidation.NormalizeRequired(request.Name);
        gallery.Note = GalleryValidation.NormalizeOptional(request.Note);
        gallery.IsPublic = request.IsPublic;

        db.GalleryItems.RemoveRange(gallery.Items);
        await db.SaveChangesAsync(ct);

        var items = BuildItems(gallery.Id, request.Items);
        gallery.Items = items;
        db.GalleryItems.AddRange(items);

        await db.SaveChangesAsync(ct);
        return GalleryMapper.ToResponse(gallery);
    }

    private static List<GalleryItem> BuildItems(int galleryId, List<SaveGalleryItemRequest> items)
        => items
            .OrderBy(x => x.DisplayOrder)
            .Select((item, index) => new GalleryItem
            {
                GalleryId = galleryId,
                ImageKey = GalleryValidation.NormalizeRequired(item.ImageKey),
                DisplayOrder = item.DisplayOrder <= 0 ? index + 1 : item.DisplayOrder,
                Name = GalleryValidation.NormalizeOptional(item.Name),
                Note = GalleryValidation.NormalizeOptional(item.Note),
                Link = GalleryValidation.NormalizeOptional(item.Link)
            })
            .ToList();
}
