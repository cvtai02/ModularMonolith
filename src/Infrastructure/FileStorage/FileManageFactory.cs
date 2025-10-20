using SharedKernel.Abstractions.Factories;
using SharedKernel.Abstractions.Services;

namespace Infrastructure.FileStorage;

public class FileManagerFactory(SettingsProvider settingsProvider) : IFileManagerFactory
{
    public SettingsProvider _settingsProvider = settingsProvider;
    public IFileManager GetFileManager(string key)
    {
        var settings = _settingsProvider.GetSettings(key).FileStorage;
        return settings.Provider switch
        {
            FileStorageProvider.CloudflareR2 => new CloudflareR2(settings),
            _ => new LocalFileSystem(settings),
        };
    }
}