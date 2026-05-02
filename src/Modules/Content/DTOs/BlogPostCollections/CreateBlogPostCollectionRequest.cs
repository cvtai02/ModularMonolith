namespace Content.DTOs.BlogPostCollections;

public class CreateBlogPostCollectionRequest
{
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; } = true;
    public List<int> BlogPostIds { get; set; } = [];
}
