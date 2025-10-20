namespace ProductCatalog.Core.Entities;

public class Option : AuditableEntity
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Name { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public virtual List<OptionValue> OptionValues { get; set; } = [];
}