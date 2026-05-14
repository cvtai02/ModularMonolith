using System.ComponentModel.DataAnnotations;

namespace Content.DTOs.BlogPostCollections;

public class ListPublicBlogPostCollectionsRequest
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 20;
}
