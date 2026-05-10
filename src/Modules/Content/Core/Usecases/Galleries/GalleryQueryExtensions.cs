using Content.Core.Entities;
using Content.DTOs.Galleries;

namespace Content.Core.Usecases.Galleries;

public static class GalleryQueryExtensions
{
    public static IQueryable<Gallery> ActiveOnly(this IQueryable<Gallery> query)
        => query.Where(x => !x.IsDeleted);

    public static IQueryable<Gallery> ApplySearch(this IQueryable<Gallery> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
            return query;

        var normalized = search.Trim().ToLowerInvariant();
        return query.Where(x =>
            x.Key.ToLower().Contains(normalized) ||
            x.Name.ToLower().Contains(normalized) ||
            x.Note.ToLower().Contains(normalized));
    }

    public static IQueryable<Gallery> ApplySorting(this IQueryable<Gallery> query, ListGalleriesRequest request)
    {
        var direction = request.SortDirection?.Trim().ToLowerInvariant();
        var descending = direction == "desc" || direction == "descending";

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "key" => descending ? query.OrderByDescending(x => x.Key) : query.OrderBy(x => x.Key),
            "name" => descending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
            "created" => descending ? query.OrderByDescending(x => x.Created) : query.OrderBy(x => x.Created),
            "lastmodified" or "last-modified" => descending ? query.OrderByDescending(x => x.LastModified) : query.OrderBy(x => x.LastModified),
            _ => query.OrderByDescending(x => x.LastModified)
        };
    }
}
