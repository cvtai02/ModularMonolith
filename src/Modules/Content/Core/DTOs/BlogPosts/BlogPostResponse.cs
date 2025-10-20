using Content.Core.Entities;

namespace Content.Core.DTOs.BlogPosts;

public class BlogPostResponse
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public BlogPostStatus Status { get; set; }
}
