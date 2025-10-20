using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public class Settings
{
    public DatabaseSettings Database { get; set; } = new();
    public JwtSettings Jwt { get; set; } = new();
    public FileStorageSettings FileStorage { get; set; } = new();
    public EventBusSettings MessageBroker { get; set; } = new();
    public CacheSettings Cache { get; set; } = new();
    public RetrySettings Retry { get; set; } = new();

    public static void RegisterModuleSettings(IServiceCollection services, string moduleKey)
    {
        services.AddKeyedSingleton(moduleKey, (sp, key) =>
        {
            Settings settings = new();
            var moduleConfigSection = sp.GetRequiredService<IConfiguration>().GetSection(moduleKey);
            if (moduleConfigSection.Exists())
            {
                moduleConfigSection.Bind(settings);
            }
            settings.ApplyDefaults(sp.GetRequiredService<Settings>());
            return settings;
        });
    }

    public static void RegisterDefaultSettings(IServiceCollection services)
    {
        services.AddSingleton((sp) =>
        {
            Settings settings = new();
            var moduleConfigSection = sp.GetRequiredService<IConfiguration>();
            moduleConfigSection.Bind(settings);
            return settings;
        });
    }

    public void ApplyDefaults(Settings defaultSettings)
    {
        Database ??= defaultSettings.Database;
        Jwt ??= defaultSettings.Jwt;
        FileStorage ??= defaultSettings.FileStorage;
        MessageBroker ??= defaultSettings.MessageBroker;
        Cache ??= defaultSettings.Cache;
        Retry ??= defaultSettings.Retry;
    }
}

public class DatabaseSettings
{
    public string ConnectionString { get; set; } = null!;
    public DatabaseProvider Provider { get; set; } = DatabaseProvider.None;
}

public class JwtSettings
{
    public string Secret { get; set; } = null!;
    public string Issuer { get; set; } = null!;    // added
    public string[] Audiences { get; set; } = null!;  // added
    public int ExpiryMinutes { get; set; }
}

public class FileStorageSettings
{
    public FileStorageProvider Provider { get; set; } = FileStorageProvider.None;
    public string ConnectionString { get; set; } = null!;
    public string ContainerName { get; set; } = null!;
}


public class EventBusSettings
{
    public string Host { get; set; } = null!;
    public int Port { get; set; }
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class CacheSettings
{
    public string? ConnectionString { get; set; }  // null = in-memory, set = Redis
    public int ExpiryMinutes { get; set; }
}

public class RetrySettings
{
    public int MaxRetries { get; set; }
    public int DelaySeconds { get; set; }
}
