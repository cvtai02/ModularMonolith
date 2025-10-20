using System.ComponentModel.DataAnnotations;

namespace Content.Core.Entities;

public class ContentFile : AuditableEntity, IReferTenantEntity
{
    [Key]
    public string Name { get; set; } = null!;
    public string Url { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
}
