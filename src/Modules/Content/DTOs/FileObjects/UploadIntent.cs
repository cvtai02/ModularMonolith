namespace Content.DTOs.FileObjects;

public class UploadIntent
{
    public string UploadId { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
}
