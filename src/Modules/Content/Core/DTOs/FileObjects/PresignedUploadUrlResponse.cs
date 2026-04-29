namespace Content.Core.DTOs.FileObjects;

public class PresignedUploadBulkUrlResponse
{
    public List<PresignedUploadUrlResponse> Files { get; set; } = [];
}

public class PresignedUploadUrlResponse
{
    public string UploadId { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string UploadUrl { get; set; } = string.Empty;
    public string PublicUrl { get; set; } = string.Empty;
    public string Method { get; set; } = "PUT";
    public Dictionary<string, string> Headers { get; set; } = [];
    public DateTimeOffset ExpiresAt { get; set; }
}
