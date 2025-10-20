namespace Content.Core.DTOs.Menus;

public class MenuResponse
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? ParentName { get; set; }
    public List<string> SubmenuNames { get; set; } = [];
}
