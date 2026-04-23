using Amazon;
using Amazon.S3;
using Infrastructure.Cache;
using Infrastructure.Data;
using Infrastructure.Data.Interceptors;
using Infrastructure.EventBus;
using Infrastructure.FileStorage;
using MediatR;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
            services.AddSingleton(sp => sp.GetRequiredService<SettingsProvider>().GetCommonSettings().EventBus!);
            services.AddSingleton(sp => sp.GetRequiredService<SettingsProvider>().GetCommonSettings().Jwt!);
            services.AddSingleton(sp => sp.GetRequiredService<SettingsProvider>().GetCommonSettings().Retry!);
            services.AddSingleton(sp => sp.GetRequiredService<SettingsProvider>().GetCommonSettings().FileStorage!);

            // Database
            services.AddSingleton(TimeProvider.System);
            services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
            services.AddScoped<ISaveChangesInterceptor, TenantEntityInterceptor>();
            services.AddScoped<ISaveChangesInterceptor, DispatchEventsInterceptor>();
            services.AddSingleton<IConfigureDbContextStrategy, ConfigureDbContextStrategy>();

            //File Storage -> Factory.
            // services.AddSingleton<IFileManagerFactory, FileManagerFactory>();
            // services.AddKeyedScoped(SettingsProvider.CommonSettingsKey, (sp, key) =>
            // {
            //     return sp.GetRequiredService<IFileManagerFactory>().GetFileManager(SettingsProvider.CommonSettingsKey);
            // });
            // services.AddScoped((sp) =>
            // {
            //     var moduleKey = sp.GetService<IModuleKeyRetrievable>()?.GetModuleKey();
            //     if ( moduleKey != null)
            //     {
            //         var service = sp.GetRequiredKeyedService<IFileManager>(moduleKey);
            //         if (service != null) return service;
            //     }

            //     return sp.GetRequiredKeyedService<IFileManager>(SettingsProvider.CommonSettingsKey);
            // });

            // use CloudflareR2 for all modules, can use factory later if want to support multiple providers
            services.AddScoped<IFileManager, CloudflareR2>();

            // EventBus
            services.AddSingleton<IMediator, Mediator>();
            services.AddSingleton<MediatREventBus>();
            services.AddSingleton<RabbitMQ>();
            services.AddSingleton<IEventBus, MediatREventBus>(); // change to RabbitMq for scale and consistency

            //Cache
            services.AddMemoryCache();
            services.AddScoped<ICacheService, MemoryCacheService>(); //could use Factory like filestorage services

            return services;
        }
    }
}
