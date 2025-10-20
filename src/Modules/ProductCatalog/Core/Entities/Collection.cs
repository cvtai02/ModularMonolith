using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.Core.Entities;

public class Collection : AuditableEntity, IReferTenantEntity
{
    [Key]
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
}