using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Infrastructure;

// alternative for IConfiguration
public sealed class SettingsProvider
{
    private static SettingsProvider? _instance;
    private static readonly Lock _lock = new();

    public static readonly string CommonSettingsKey = "CommonSettings";
    private readonly Dictionary<string, Settings> _settings = [];
    private readonly IConfiguration configuration;

    private SettingsProvider(IConfiguration cfg)
    {
        configuration = cfg;
    }

    public static SettingsProvider GetInstance(IConfiguration cfg)
    {
        if (_instance is null)
        {
            lock (_lock)
            {
                _instance ??= new SettingsProvider(cfg);
            }
        }
        return _instance;
    }

    public static SettingsProvider GetInstance(IHostApplicationBuilder builder)
    {
        if (_instance is null)
        {
            lock (_lock)
            {
                _instance ??= new SettingsProvider(builder.Configuration);
            }
        }
        return _instance;
    }

    public Settings GetSettings(string moduleKey)
    {
        if(!_settings.ContainsKey(moduleKey)) LoadSettings(moduleKey);
        return _settings.GetValueOrDefault(moduleKey) ?? GetCommonSettings();
    }

    public Settings GetCommonSettings()
    {
        if(!_settings.ContainsKey(CommonSettingsKey)) LoadDefaultSettings();
        return _settings.GetValueOrDefault(CommonSettingsKey) ?? new Settings();
    }

    private void LoadSettings(string moduleKey)
    {
        var settings = new Settings();
        var moduleConfigSection = configuration.GetSection(moduleKey);
        if (moduleConfigSection.Exists())
        {
            moduleConfigSection.Bind(settings);
        }
        settings.ApplyDefaults(GetCommonSettings());
        _settings[moduleKey] = settings;
    }

    private void LoadDefaultSettings()
    {
        var settings = new Settings();
        configuration.Bind(settings);
        _settings.Add(CommonSettingsKey, settings);
    }
}