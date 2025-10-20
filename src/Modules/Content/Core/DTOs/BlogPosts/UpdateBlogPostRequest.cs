using System.ComponentModel.DataAnnotations;
using Content.Core.Entities;

namespace Content.Core.DTOs.BlogPosts;

public class UpdateBlogPostRequest
{
    [MaxLength(200)]
    public string? Slug { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Summary { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string ImageUrl { get; set; } = string.Empty;

    public BlogPostStatus Status { get; set; } = BlogPostStatus.Draft;
}
