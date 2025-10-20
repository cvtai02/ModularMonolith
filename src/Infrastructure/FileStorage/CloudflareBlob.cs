using SharedKernel;
using SharedKernel.Abstractions.Services;

namespace Infrastructure.FileStorage;

public class CloudflareR2 : IFileManager
{
    public CloudflareR2(FileStorageSettings s)
    {
        
    }

    public Task DeleteAsync(string path)
    {
        throw new NotImplementedException();
    }

    public Task<Stream?> DownloadAsync(string path)
    {
        throw new NotImplementedException();
    }

    public Task<string> UploadAsync(string path, Stream file)
    {
        throw new NotImplementedException();
    }
}