using Content.Core.Entities;
using Content.DTOs.Galleries;

namespace Content.Core.Usecases.Galleries;

public static class GalleryMapper
{
    public static GalleryResponse ToResponse(Gallery gallery) => new()
    {
        Id = gallery.Id,
        Key = gallery.Key,
        Name = gallery.Name,
        Note = gallery.Note,
        IsPublic = gallery.IsPublic,
        Items = gallery.Items
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.DisplayOrder)
            .Select(ToItemResponse)
            .ToList(),
        Created = gallery.Created,
        LastModified = gallery.LastModified
    };

    public static GallerySummaryResponse ToSummary(Gallery gallery) => new()
    {
        Id = gallery.Id,
        Key = gallery.Key,
        Name = gallery.Name,
        Note = gallery.Note,
        IsPublic = gallery.IsPublic,
        ItemCount = gallery.Items.Count(x => !x.IsDeleted),
        Created = gallery.Created,
        LastModified = gallery.LastModified
    };

    private static GalleryItemResponse ToItemResponse(GalleryItem item) => new()
    {
        Id = item.Id,
        ImageKey = item.ImageKey,
        DisplayOrder = item.DisplayOrder,
        Name = item.Name,
        Note = item.Note,
        Link = item.Link
    };
}
