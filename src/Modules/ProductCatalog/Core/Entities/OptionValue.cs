using Microsoft.EntityFrameworkCore;

namespace ProductCatalog.Core.Entities;

[PrimaryKey(nameof(OptionId), nameof(Value))]
public class OptionValue : AuditableEntity
{
    public int OptionId { get; set; }
    public string Value { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public string? ImageUrl { get; set; }
}