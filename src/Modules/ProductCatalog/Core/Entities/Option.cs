namespace ProductCatalog.Core.Entities;

public class Option : AuditableEntity
{
    public int Id { get; set; }
    public string ProductId { get; set; } = string.Empty;
    public string Name { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public virtual List<OptionValue> OptionValues { get; set; } = [];
    public virtual Product Product { get; set; } = null!;
}
