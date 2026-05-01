using Content.DTOs.BlogPosts;
using Content.Core.Entities;

namespace Content.Core.Usecases.BlogPosts;

public static class BlogPostMapper
{
    public static BlogPostResponse ToResponse(BlogPost post) => new()
    {
        Id = post.Id,
        Title = post.Title,
        Slug = post.Slug,
        Content = post.Content,
        Summary = post.Summary,
        ImageUrl = post.ImageUrl,
        Status = post.Status,
        PublishedAt = post.PublishedAt,
        Created = post.Created,
        LastModified = post.LastModified
    };

    public static BlogPostSummaryResponse ToSummary(BlogPost post) => new()
    {
        Id = post.Id,
        Title = post.Title,
        Slug = post.Slug,
        Summary = post.Summary,
        ImageUrl = post.ImageUrl,
        Status = post.Status,
        PublishedAt = post.PublishedAt,
        Created = post.Created,
        LastModified = post.LastModified
    };
}
