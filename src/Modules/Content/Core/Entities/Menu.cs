namespace Content.Core.Entities;

public class Menu : AuditableEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public Menu? Parent { get; set; }
    public ICollection<Menu> Submenus { get; set; } = [];
}
