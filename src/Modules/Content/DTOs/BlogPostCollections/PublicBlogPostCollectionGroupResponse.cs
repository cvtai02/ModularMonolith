using Content.DTOs.BlogPosts;

namespace Content.DTOs.BlogPostCollections;

public class PublicBlogPostCollectionGroupResponse
{
    public int CollectionId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; } = true;
    public int ItemCount { get; set; }
    public List<BlogPostSummaryResponse> Items { get; set; } = [];
}
