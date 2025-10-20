using System.ComponentModel.DataAnnotations;

namespace Content.Core.Entities;

public class BlogPost : AuditableEntity, IReferTenantEntity
{
    [Key]
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public BlogPostStatus Status { get; set; } = BlogPostStatus.Draft;
}

public enum BlogPostStatus
{
    Draft,
    Published,
    Archived
}
