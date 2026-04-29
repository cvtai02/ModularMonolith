namespace Content.Core.DTOs.FileObjects;

public class ConfirmUploadResponse
{
    public List<UploadResponse> Files { get; set; } = [];
}

public class UploadResponse
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string PublicUrl { get; set; } = string.Empty;
}
