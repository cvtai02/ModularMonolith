namespace Content.Core.DTOs.ContentFiles;

public class ContentFileResponse
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
}
