using SharedKernel.Abstractions.Factories;
using SharedKernel.Abstractions.Services;

namespace Infrastructure.FileStorage;

[Obsolete("This factory is for development/testing purposes only.")]
public class FileManagerFactory(SettingsProvider settingsProvider, ITenant tenant) : IFileManagerFactory
{
    public SettingsProvider _settingsProvider = settingsProvider;
    public IFileManager GetFileManager(string key)
    {
        var settings = _settingsProvider.GetSettings(key).FileStorage;
        return settings?.Provider switch
        {
            ObjectStorageProvider.CloudflareR2 => new CloudflareR2(settings, tenant),
            _ => throw new SettingsException("No provider in appsettings")
        };
    }
}
