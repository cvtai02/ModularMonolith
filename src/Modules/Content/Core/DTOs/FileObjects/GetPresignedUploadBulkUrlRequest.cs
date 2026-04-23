using System.ComponentModel.DataAnnotations;

namespace Content.Core.DTOs.FileObjects;

public class GetPresignedUploadBulkUrlRequest
{
    [Required]
    public List<PresignedUploadFileRequest> Files { get; set; } = [];

    [Range(1, 1440)]
    public int ExpiryMinutes { get; set; } = 15;
}

public class PresignedUploadFileRequest
{
    [MaxLength(500)]
    public string? Key { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Ext { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;
}
