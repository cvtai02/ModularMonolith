using System.ComponentModel.DataAnnotations;

namespace Content.Core.DTOs.MetaObjects;

public class CreateMetaObjectRequest
{
    [Required]
    [MaxLength(200)]
    public string Key { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Namespace { get; set; } = string.Empty;

    [Required]
    public string Value { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty;
}
