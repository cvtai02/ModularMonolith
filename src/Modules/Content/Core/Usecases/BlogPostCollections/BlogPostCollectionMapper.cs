using Content.Core.Entities;
using Content.Core.Usecases.BlogPosts;
using Content.DTOs.BlogPostCollections;

namespace Content.Core.Usecases.BlogPostCollections;

public static class BlogPostCollectionMapper
{
    public static BlogPostCollectionResponse ToResponse(BlogPostCollection collection) => new()
    {
        Id = collection.Id,
        Key = collection.Key,
        Title = collection.Title,
        Description = collection.Description,
        IsPublic = collection.IsPublic,
        Items = collection.Items
            .Where(x => !x.IsDeleted && !x.BlogPost.IsDeleted)
            .OrderBy(x => x.DisplayOrder)
            .Select(x => BlogPostMapper.ToSummary(x.BlogPost))
            .ToList(),
        Created = collection.Created,
        LastModified = collection.LastModified
    };

    public static BlogPostCollectionSummaryResponse ToSummary(BlogPostCollection collection) => new()
    {
        Id = collection.Id,
        Key = collection.Key,
        Title = collection.Title,
        Description = collection.Description,
        IsPublic = collection.IsPublic,
        ItemCount = collection.Items.Count(x => !x.IsDeleted && !x.BlogPost.IsDeleted),
        Created = collection.Created,
        LastModified = collection.LastModified
    };
}
