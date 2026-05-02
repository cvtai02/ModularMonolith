using Content.Core.Entities;
using Content.Core.Usecases.BlogPosts;
using Content.DTOs.BlogPostCollections;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPostCollections;

public class UpdateBlogPostCollection(ContentDbContext db)
{
    public async Task<BlogPostCollectionResponse?> ExecuteAsync(
        int id,
        UpdateBlogPostCollectionRequest request,
        CancellationToken ct)
    {
        BlogPostCollectionValidation.Validate(request);

        var collection = await db.BlogPostCollections
            .ActiveOnly()
            .Include(x => x.Items.Where(i => !i.IsDeleted))
                .ThenInclude(x => x.BlogPost)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (collection is null)
        {
            return null;
        }

        var posts = await LoadAndValidatePostsAsync(request.BlogPostIds, request.IsPublic, ct);

        collection.Title = BlogPostCollectionValidation.NormalizeRequired(request.Title);
        collection.Description = BlogPostCollectionValidation.NormalizeOptional(request.Description);
        collection.IsPublic = request.IsPublic;

        db.BlogPostCollectionItems.RemoveRange(collection.Items);
        await db.SaveChangesAsync(ct);

        var items = posts.Select((post, index) => new BlogPostCollectionItem
        {
            BlogPostCollectionId = collection.Id,
            BlogPostId = post.Id,
            BlogPost = post,
            DisplayOrder = index + 1
        }).ToList();

        collection.Items = items;
        db.BlogPostCollectionItems.AddRange(items);

        await db.SaveChangesAsync(ct);
        return BlogPostCollectionMapper.ToResponse(collection);
    }

    private async Task<List<BlogPost>> LoadAndValidatePostsAsync(List<int> ids, bool isPublic, CancellationToken ct)
    {
        if (ids.Count == 0)
        {
            return [];
        }

        var posts = await db.BlogPosts
            .ActiveOnly()
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(ct);

        ValidatePosts(ids, posts, isPublic);
        var byId = posts.ToDictionary(x => x.Id);
        return ids.Select(id => byId[id]).ToList();
    }

    private static void ValidatePosts(List<int> ids, List<BlogPost> posts, bool isPublic)
    {
        var foundIds = posts.Select(x => x.Id).ToHashSet();
        var missingIds = ids.Where(id => !foundIds.Contains(id)).ToList();
        if (missingIds.Count > 0)
        {
            BlogPostCollectionValidation.Throw("BlogPostIds", $"Blog post ids were not found: {string.Join(", ", missingIds)}.");
        }

        if (isPublic)
        {
            var unpublishedIds = posts
                .Where(x => x.Status != BlogPostStatus.Published)
                .Select(x => x.Id)
                .ToList();

            if (unpublishedIds.Count > 0)
            {
                BlogPostCollectionValidation.Throw("BlogPostIds", $"Public collections can only include published blog posts: {string.Join(", ", unpublishedIds)}.");
            }
        }
    }
}
