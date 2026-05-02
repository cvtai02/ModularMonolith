using Content.Core.Entities;
using Content.Core.Usecases.BlogPosts;
using Content.DTOs.BlogPostCollections;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPostCollections;

public class CreateBlogPostCollection(ContentDbContext db)
{
    public async Task<BlogPostCollectionResponse> ExecuteAsync(
        CreateBlogPostCollectionRequest request,
        CancellationToken ct)
    {
        BlogPostCollectionValidation.Validate(request);

        var key = BlogPostCollectionValidation.NormalizeKey(request.Key);
        var exists = await db.BlogPostCollections
            .ActiveOnly()
            .AnyAsync(x => x.Key == key, ct);

        if (exists)
        {
            BlogPostCollectionValidation.Throw("Key", "A blog post collection with this key already exists.");
        }

        var posts = await LoadAndValidatePostsAsync(request.BlogPostIds, request.IsPublic, ct);
        var collection = new BlogPostCollection
        {
            Key = key,
            Title = BlogPostCollectionValidation.NormalizeRequired(request.Title),
            Description = BlogPostCollectionValidation.NormalizeOptional(request.Description),
            IsPublic = request.IsPublic,
            Items = posts.Select((post, index) => new BlogPostCollectionItem
            {
                BlogPost = post,
                DisplayOrder = index + 1
            }).ToList()
        };

        db.BlogPostCollections.Add(collection);
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
