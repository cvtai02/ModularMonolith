namespace Content.Core.DTOs.FileObjects;

public class PresignedUploadUrlResponse
{
    public string Key { get; set; } = string.Empty;
    public string UploadUrl { get; set; } = string.Empty;
    public string PublicUrl { get; set; } = string.Empty;
}
