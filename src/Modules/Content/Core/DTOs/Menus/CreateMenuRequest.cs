using System.ComponentModel.DataAnnotations;

namespace Content.Core.DTOs.Menus;

public class CreateMenuRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Url { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? ParentName { get; set; }
}
