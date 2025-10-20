using Infrastructure.Cache;
using Infrastructure.Data;
using Infrastructure.Data.Interceptors;
using Infrastructure.EventBus;
using Infrastructure.FileStorage;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SharedKernel;
using SharedKernel.Abstractions.Factories;
using SharedKernel.Abstractions.Services;

namespace Infrastructure;

public static class InfrastructureInjection
{
    extension (IServiceCollection services)
    {
        /// Common Infra
        public IServiceCollection AddInfrastructure()
        {
            // Map Configuration
            services.AddSingleton(sp => SettingsProvider.GetInstance(sp.GetRequiredService<IConfiguration>()));

            // Database
            services.AddSingleton(TimeProvider.System);
            services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
            services.AddSingleton<IConfigureDbContextStrategy, ConfigureDbContextStrategy>();

            //File Storage -> Factory.
            services.AddSingleton<IFileManagerFactory, FileManagerFactory>();
            services.AddKeyedScoped(SettingsProvider.CommonSettingsKey, (sp, key) =>
            {
                return sp.GetRequiredService<IFileManagerFactory>().GetFileManager(SettingsProvider.CommonSettingsKey);
            });
            services.AddScoped((sp) =>
            {
                var moduleKey = sp.GetService<IModuleKeyRetrievable>()?.GetModuleKey();
                if ( moduleKey != null)
                {
                    var service = sp.GetRequiredKeyedService<IFileManager>(moduleKey);
                    if (service != null) return service;
                }

                return sp.GetRequiredKeyedService<IFileManager>(SettingsProvider.CommonSettingsKey);
            });

            // EventBus
            services.AddSingleton<IEventBus>(sp =>
            {
                return sp.GetRequiredService<IHostEnvironment>().IsDevelopment() ? new MediatREventBus() : new RabbitMQ();
            });    

            //Cache
            services.AddMemoryCache();
            services.AddScoped<ICacheService, MemoryCacheService>(); //could use Factory like filestorage services

            return services;
        }
    }
}