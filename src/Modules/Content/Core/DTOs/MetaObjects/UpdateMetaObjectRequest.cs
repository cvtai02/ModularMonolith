using System.ComponentModel.DataAnnotations;

namespace Content.Core.DTOs.MetaObjects;

public class UpdateMetaObjectRequest
{
    [Required]
    [MaxLength(200)]
    public string Namespace { get; set; } = string.Empty;

    [Required]
    public string Value { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty;
}
