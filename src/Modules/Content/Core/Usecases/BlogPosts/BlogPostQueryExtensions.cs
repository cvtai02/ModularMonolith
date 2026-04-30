using Content.Core.DTOs.BlogPosts;
using Content.Core.Entities;

namespace Content.Core.Usecases.BlogPosts;

public static class BlogPostQueryExtensions
{
    public static IQueryable<BlogPost> ActiveOnly(this IQueryable<BlogPost> query)
        => query.Where(x => !x.IsDeleted);

    public static IQueryable<BlogPost> ApplySearch(this IQueryable<BlogPost> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var normalized = search.Trim().ToLowerInvariant();
        return query.Where(x =>
            x.Title.ToLower().Contains(normalized) ||
            x.Summary.ToLower().Contains(normalized) ||
            x.Slug.ToLower().Contains(normalized));
    }

    public static IQueryable<BlogPost> ApplySorting(this IQueryable<BlogPost> query, ListBlogPostsRequest request)
    {
        var direction = request.SortDirection?.Trim().ToLowerInvariant();
        var descending = direction == "desc" || direction == "descending";

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "title" => descending ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
            "slug" => descending ? query.OrderByDescending(x => x.Slug) : query.OrderBy(x => x.Slug),
            "status" => descending ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
            "created" => descending ? query.OrderByDescending(x => x.Created) : query.OrderBy(x => x.Created),
            "lastmodified" or "last-modified" => descending ? query.OrderByDescending(x => x.LastModified) : query.OrderBy(x => x.LastModified),
            "publishedat" or "published-at" => descending ? query.OrderByDescending(x => x.PublishedAt) : query.OrderBy(x => x.PublishedAt),
            _ => query.OrderByDescending(x => x.PublishedAt ?? x.LastModified)
        };
    }
}
