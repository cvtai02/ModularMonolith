using System.ComponentModel.DataAnnotations;

namespace Content.Core.Entities;

public class MetaObject : AuditableEntity, IReferTenantEntity
{
    [Key]
    public string Key { get; set; } = null!;
    public string Namespace { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // e.g., string, integer, json
}
