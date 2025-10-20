using System.ComponentModel.DataAnnotations;

namespace Content.Core.Entities;

public class Menu : AuditableEntity, IReferTenantEntity
{
    [Key]
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? ParentName { get; set; }
    
    public Menu? Parent { get; set; }
    public ICollection<Menu> Submenus { get; set; } = [];
}
