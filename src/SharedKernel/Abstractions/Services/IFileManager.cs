using Microsoft.EntityFrameworkCore.Diagnostics;

namespace SharedKernel.Abstractions.Services;

// TODO: Apply Interface segregation principle - separate file manager for each module is not necessary, we can just use one file manager for all modules, and use moduleKey to distinguish which module is using it, this also make it easier to manage and maintain the file manager
public interface IFileManager
{
    // return null for null key
    string? BuildPublicUrl(string? key);
    Task<List<string>> GetPresignedUploadBulkUrlAsync(IEnumerable<PresignedUploadParameters> parameters, TimeSpan expiresIn, CancellationToken cancellationToken = default);
    Task<FileObjectMetadata?> GetObjectMetadataAsync(string key, CancellationToken cancellationToken = default);
    Task DeleteBulkAsync(IEnumerable<string> keys, CancellationToken cancellationToken = default);

    Task<string> UploadAsync(IEnumerable<UploadFileDto> dto, CancellationToken cancellationToken = default);
}

public class PresignedUploadParameters
{
    public string? Key { get; set; } = null!;
    public string Category { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public string Ext { get; set; } = null!;
}

public class UploadFileDto
{
    public string? Key { get; set; } = null!;
    public string Category { get; set; } = null!;
    public Stream File { get; set; } = null!;
    public string Ext { get; set; } = null!;
    public string ContentType { get; set; } = null!;    
}

public class FileObjectMetadata
{
    public string Key { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
}
