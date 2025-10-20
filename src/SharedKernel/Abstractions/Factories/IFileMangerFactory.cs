using SharedKernel.Abstractions.Services;

namespace SharedKernel.Abstractions.Factories;

public interface IFileManagerFactory
{
    IFileManager GetFileManager(string key);
}