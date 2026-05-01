using System.ComponentModel.DataAnnotations;

namespace Content.DTOs.FileObjects;

public class ConfirmUploadRequest
{
    [Required]
    public List<ConfirmUploadFileRequest> Files { get; set; } = [];
}

public class ConfirmUploadFileRequest
{
    [Required]
    [MaxLength(500)]
    public string UploadId { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Key { get; set; } = string.Empty;
}
