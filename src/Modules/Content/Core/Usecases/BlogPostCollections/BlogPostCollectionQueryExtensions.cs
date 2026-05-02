using Content.Core.Entities;
using Content.DTOs.BlogPostCollections;

namespace Content.Core.Usecases.BlogPostCollections;

public static class BlogPostCollectionQueryExtensions
{
    public static IQueryable<BlogPostCollection> ActiveOnly(this IQueryable<BlogPostCollection> query)
        => query.Where(x => !x.IsDeleted);

    public static IQueryable<BlogPostCollectionItem> ActiveOnly(this IQueryable<BlogPostCollectionItem> query)
        => query.Where(x => !x.IsDeleted);

    public static IQueryable<BlogPostCollection> ApplySearch(this IQueryable<BlogPostCollection> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var normalized = search.Trim().ToLowerInvariant();
        return query.Where(x =>
            x.Key.ToLower().Contains(normalized) ||
            x.Title.ToLower().Contains(normalized) ||
            x.Description.ToLower().Contains(normalized));
    }

    public static IQueryable<BlogPostCollection> ApplySorting(
        this IQueryable<BlogPostCollection> query,
        ListBlogPostCollectionsRequest request)
    {
        var direction = request.SortDirection?.Trim().ToLowerInvariant();
        var descending = direction == "desc" || direction == "descending";

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "key" => descending ? query.OrderByDescending(x => x.Key) : query.OrderBy(x => x.Key),
            "title" => descending ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
            "created" => descending ? query.OrderByDescending(x => x.Created) : query.OrderBy(x => x.Created),
            "lastmodified" or "last-modified" => descending ? query.OrderByDescending(x => x.LastModified) : query.OrderBy(x => x.LastModified),
            _ => query.OrderByDescending(x => x.LastModified)
        };
    }
}
