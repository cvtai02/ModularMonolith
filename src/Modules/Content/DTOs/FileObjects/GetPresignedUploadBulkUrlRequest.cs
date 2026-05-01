using System.ComponentModel.DataAnnotations;

namespace Content.DTOs.FileObjects;

public class GetPresignedUploadBulkUrlRequest
{
    [Required]
    public List<CreatePresignedUploadFileRequest> Files { get; set; } = [];

    [Range(1, 60)]
    public int ExpiryMinutes { get; set; } = 15;
}

public class CreatePresignedUploadFileRequest
{
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string ContentType { get; set; } = string.Empty;

    public long Size { get; set; }
}
