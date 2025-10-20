namespace SharedKernel.Abstractions.Services;

public interface IFileManager
{
    Task<string> UploadAsync(string path, Stream file);
    Task<Stream?> DownloadAsync(string path);
    Task DeleteAsync(string path);
}