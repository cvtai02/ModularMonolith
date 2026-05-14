using Content.Core.Entities;
using Content.Core.Usecases.BlogPosts;
using Content.DTOs.BlogPostCollections;
using Microsoft.EntityFrameworkCore;
using SharedKernel.DTOs;

namespace Content.Core.Usecases.BlogPostCollections;

[UsecaseInject]
public class ListPublicBlogPostCollections(ContentDbContext db)
{
    public async Task<PaginatedList<PublicBlogPostCollectionGroupResponse>> ExecuteAsync(
        ListPublicBlogPostCollectionsRequest request,
        CancellationToken ct)
    {
        request ??= new ListPublicBlogPostCollectionsRequest();

        var query = db.BlogPostCollections
            .AsNoTracking()
            .ActiveOnly()
            .Where(x => x.IsPublic)
            .OrderByDescending(x => x.LastModified);

        var totalCount = await query.CountAsync(ct);
        var collections = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        if (collections.Count == 0)
        {
            return new PaginatedList<PublicBlogPostCollectionGroupResponse>(
                [],
                totalCount,
                request.PageNumber,
                request.PageSize);
        }

        var collectionIds = collections.Select(x => x.Id).ToList();
        var collectionItems = await db.BlogPostCollectionItems
            .AsNoTracking()
            .ActiveOnly()
            .Include(x => x.BlogPost)
            .Where(x =>
                collectionIds.Contains(x.BlogPostCollectionId) &&
                !x.BlogPost.IsDeleted &&
                x.BlogPost.Status == BlogPostStatus.Published)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(ct);

        var itemsByCollection = collectionItems
            .GroupBy(x => x.BlogPostCollectionId)
            .ToDictionary(
                x => x.Key,
                x => x.Select(i => i.BlogPost).ToList());

        var groups = collections.Select(collection =>
        {
            itemsByCollection.TryGetValue(collection.Id, out var posts);
            posts ??= [];

            return new PublicBlogPostCollectionGroupResponse
            {
                CollectionId = collection.Id,
                Key = collection.Key,
                Title = collection.Title,
                Description = collection.Description,
                IsPublic = true,
                ItemCount = posts.Count,
                Items = posts.Select(BlogPostMapper.ToSummary).ToList()
            };
        }).ToList();

        return new PaginatedList<PublicBlogPostCollectionGroupResponse>(
            groups,
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}
