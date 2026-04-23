using SharedKernel.Abstractions.Services;

namespace SharedKernel.Abstractions.Factories;

[Obsolete("Not separate file manager for each module anymore")]
public interface IFileManagerFactory
{
    IFileManager GetFileManager(string moduleKey);
}