using Content.Core.Entities;
using Content.Core.Usecases.BlogPosts;
using Content.DTOs.BlogPosts;
using Content.DTOs.BlogPostCollections;
using Microsoft.EntityFrameworkCore;
using SharedKernel.DTOs;

namespace Content.Core.Usecases.BlogPostCollections;

public class ListAdminBlogPostsByCollection(ContentDbContext db)
{
    public async Task<PaginatedList<AdminBlogPostCollectionGroupResponse>> ExecuteAsync(
        ListAdminBlogPostsByCollectionRequest request,
        CancellationToken ct)
    {
        request ??= new ListAdminBlogPostsByCollectionRequest();

        var normalizedSearch = NormalizeSearch(request.Search);
        var collectionQuery = BuildCollectionQuery(request, normalizedSearch);
        var collectionCount = await collectionQuery.CountAsync(ct);

        var ungroupedPostsQuery = BuildUngroupedPostsQuery(request, normalizedSearch);
        var ungroupedPostCount = await ungroupedPostsQuery.CountAsync(ct);
        var hasUngrouped = ungroupedPostCount > 0;
        var totalCount = collectionCount + (hasUngrouped ? 1 : 0);

        var skip = (request.PageNumber - 1) * request.PageSize;
        var groups = new List<AdminBlogPostCollectionGroupResponse>();

        if (skip < collectionCount)
        {
            var take = Math.Min(request.PageSize, collectionCount - skip);
            var collections = await collectionQuery
                .Skip(skip)
                .Take(take)
                .ToListAsync(ct);

            groups.AddRange(await ToCollectionGroupsAsync(collections, request, normalizedSearch, ct));
        }

        if (hasUngrouped && groups.Count < request.PageSize && skip + groups.Count <= collectionCount)
        {
            var ungroupedPosts = await ApplyBlogPostFilters(
                    ungroupedPostsQuery,
                    request,
                    normalizedSearch)
                .ApplySorting(new ListBlogPostsRequest
                {
                    SortBy = request.SortBy,
                    SortDirection = request.SortDirection
                })
                .ToListAsync(ct);

            groups.Add(new AdminBlogPostCollectionGroupResponse
            {
                CollectionId = null,
                Key = "ungrouped",
                Title = "Ungrouped",
                Description = "Blog posts not assigned to any collection.",
                IsPublic = false,
                IsUngrouped = true,
                ItemCount = ungroupedPosts.Count,
                Items = ungroupedPosts.Select(BlogPostMapper.ToSummary).ToList()
            });
        }

        return new PaginatedList<AdminBlogPostCollectionGroupResponse>(
            groups,
            totalCount,
            request.PageNumber,
            request.PageSize);
    }

    private IQueryable<BlogPostCollection> BuildCollectionQuery(
        ListAdminBlogPostsByCollectionRequest request,
        string? normalizedSearch)
    {
        var query = db.BlogPostCollections
            .AsNoTracking()
            .ActiveOnly();

        if (request.IsPublic.HasValue)
        {
            query = query.Where(x => x.IsPublic == request.IsPublic.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Items.Any(i =>
                !i.IsDeleted &&
                !i.BlogPost.IsDeleted &&
                i.BlogPost.Status == request.Status.Value));
        }

        if (!string.IsNullOrEmpty(normalizedSearch))
        {
            query = query.Where(x =>
                x.Key.ToLower().Contains(normalizedSearch) ||
                x.Title.ToLower().Contains(normalizedSearch) ||
                x.Description.ToLower().Contains(normalizedSearch) ||
                x.Items.Any(i =>
                    !i.IsDeleted &&
                    !i.BlogPost.IsDeleted &&
                    (i.BlogPost.Title.ToLower().Contains(normalizedSearch) ||
                     i.BlogPost.Summary.ToLower().Contains(normalizedSearch) ||
                     i.BlogPost.Slug.ToLower().Contains(normalizedSearch))));
        }

        return ApplyCollectionSorting(query, request);
    }

    private async Task<List<AdminBlogPostCollectionGroupResponse>> ToCollectionGroupsAsync(
        List<BlogPostCollection> collections,
        ListAdminBlogPostsByCollectionRequest request,
        string? normalizedSearch,
        CancellationToken ct)
    {
        if (collections.Count == 0)
        {
            return [];
        }

        var collectionIds = collections.Select(x => x.Id).ToList();
        var items = await db.BlogPostCollectionItems
            .AsNoTracking()
            .ActiveOnly()
            .Where(x =>
                collectionIds.Contains(x.BlogPostCollectionId) &&
                !x.BlogPost.IsDeleted)
            .Where(x => !request.Status.HasValue || x.BlogPost.Status == request.Status.Value)
            .Where(x => string.IsNullOrEmpty(normalizedSearch) ||
                x.BlogPost.Title.ToLower().Contains(normalizedSearch) ||
                x.BlogPost.Summary.ToLower().Contains(normalizedSearch) ||
                x.BlogPost.Slug.ToLower().Contains(normalizedSearch) ||
                x.BlogPostCollection.Key.ToLower().Contains(normalizedSearch) ||
                x.BlogPostCollection.Title.ToLower().Contains(normalizedSearch) ||
                x.BlogPostCollection.Description.ToLower().Contains(normalizedSearch))
            .Include(x => x.BlogPost)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(ct);

        var itemsByCollection = items
            .GroupBy(x => x.BlogPostCollectionId)
            .ToDictionary(x => x.Key, x => x.Select(i => i.BlogPost).ToList());

        return collections.Select(collection =>
        {
            itemsByCollection.TryGetValue(collection.Id, out var posts);
            posts ??= [];

            return new AdminBlogPostCollectionGroupResponse
            {
                CollectionId = collection.Id,
                Key = collection.Key,
                Title = collection.Title,
                Description = collection.Description,
                IsPublic = collection.IsPublic,
                IsUngrouped = false,
                ItemCount = posts.Count,
                Items = posts.Select(BlogPostMapper.ToSummary).ToList()
            };
        }).ToList();
    }

    private IQueryable<BlogPost> BuildUngroupedPostsQuery(
        ListAdminBlogPostsByCollectionRequest request,
        string? normalizedSearch)
    {
        var assignedPostIds = db.BlogPostCollectionItems
            .AsNoTracking()
            .ActiveOnly()
            .Where(x => !x.BlogPostCollection.IsDeleted && !x.BlogPost.IsDeleted)
            .Select(x => x.BlogPostId);

        var query = db.BlogPosts
            .AsNoTracking()
            .ActiveOnly()
            .Where(x => !assignedPostIds.Contains(x.Id));

        return ApplyBlogPostFilters(query, request, normalizedSearch);
    }

    private static IQueryable<BlogPost> ApplyBlogPostFilters(
        IQueryable<BlogPost> query,
        ListAdminBlogPostsByCollectionRequest request,
        string? normalizedSearch)
    {
        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        if (!string.IsNullOrEmpty(normalizedSearch))
        {
            query = query.Where(x =>
                x.Title.ToLower().Contains(normalizedSearch) ||
                x.Summary.ToLower().Contains(normalizedSearch) ||
                x.Slug.ToLower().Contains(normalizedSearch));
        }

        return query;
    }

    private static IQueryable<BlogPostCollection> ApplyCollectionSorting(
        IQueryable<BlogPostCollection> query,
        ListAdminBlogPostsByCollectionRequest request)
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

    private static string? NormalizeSearch(string? search)
        => string.IsNullOrWhiteSpace(search) ? null : search.Trim().ToLowerInvariant();
}
