namespace ProductCatalog.Core.Entities;

public class VariantOptionValue : AuditableEntity
{
    public int Id { get; set; }
    public string VariantId { get; set; } = string.Empty;
    public int OptionId { get; set; }
    public string OptionName { get; set; } = null!;
    public string Value { get; set; } = null!;
}
