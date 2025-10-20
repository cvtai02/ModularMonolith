using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using SharedKernel.Abstractions.Factories;

namespace Infrastructure.Data;

public class ConfigureDbContextStrategy(SettingsProvider settingsProvider) : IConfigureDbContextStrategy
{
    private readonly SettingsProvider provider = settingsProvider;
    private static string GetMigrationsHistoryTableName (string key)
    {
        return $"__EFMigrationsHistory_{key}";
    }
    public void ConfigureDbContext(IServiceProvider sprovider, DbContextOptionsBuilder options, string key)
    {
        var settings = provider.GetSettings(key).Database;
        options.AddInterceptors(sprovider.GetServices<ISaveChangesInterceptor>());
        switch (settings.Provider)
        {
            case DatabaseProvider.PostgreSQL:
                options.UseNpgsql(settings.ConnectionString, x => x.MigrationsHistoryTable(GetMigrationsHistoryTableName(key)));
                break;
            case DatabaseProvider.SqlServer:
                options.UseSqlServer(settings.ConnectionString, x => x.MigrationsHistoryTable(GetMigrationsHistoryTableName(key)));
                break;
            
            default: break;
        }
    }
}