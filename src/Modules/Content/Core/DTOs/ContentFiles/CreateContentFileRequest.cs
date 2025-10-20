using System.ComponentModel.DataAnnotations;

namespace Content.Core.DTOs.ContentFiles;

public class CreateContentFileRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Url { get; set; } = string.Empty;

    [MaxLength(200)]
    public string ContentType { get; set; } = string.Empty;

    [Range(0, long.MaxValue)]
    public long Size { get; set; }
}
