using SharedKernel;
using SharedKernel.Abstractions.Services;

namespace Infrastructure.FileStorage;

public class LocalFileSystem : IFileManager
{
    public LocalFileSystem(FileStorageSettings s)
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