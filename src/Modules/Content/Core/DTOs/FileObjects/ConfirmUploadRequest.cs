using System.ComponentModel.DataAnnotations;

namespace Content.Core.DTOs.FileObjects;

public class ConfirmUploadRequest
{
    [Required]
    public List<ConfirmUploadFileRequest> Files { get; set; } = [];
}

public class ConfirmUploadFileRequest
{
    [Required]
    [MaxLength(500)]
    public string Key { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(200)]
    public string ContentType { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Name { get; set; } = string.Empty;

    public long Size { get; set; }
}
