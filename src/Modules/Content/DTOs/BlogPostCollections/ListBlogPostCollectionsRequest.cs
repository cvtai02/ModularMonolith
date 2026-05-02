using System.ComponentModel.DataAnnotations;

namespace Content.DTOs.BlogPostCollections;

public class ListBlogPostCollectionsRequest
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 200)]
    public int PageSize { get; set; } = 20;

    public string? Search { get; set; }
    public bool? IsPublic { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
}
