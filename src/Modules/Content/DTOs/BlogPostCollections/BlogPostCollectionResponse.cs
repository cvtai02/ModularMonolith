using Content.DTOs.BlogPosts;

namespace Content.DTOs.BlogPostCollections;

public class BlogPostCollectionResponse
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public List<BlogPostSummaryResponse> Items { get; set; } = [];
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }
}
