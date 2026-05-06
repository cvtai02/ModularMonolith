using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SharedKernel.Abstractions.Factories;

namespace SharedKernel.Abstractions.Contracts;

/// <summary>
/// Contracts for automatic module services injection.
/// </summary>
public abstract class Module(IHostApplicationBuilder builder)
{
    public abstract string Key { get; }
    public string UseCasesNamespace => $"{Key}.Core.Usecases";
    public string EventHandlersNamespace => $"{Key}.Core.EventHandlers";
    public string IntermediaryServicesNamespace => $"{Key}.Core.Services";

    public IHostApplicationBuilder Builder { get; } = builder;
    public IServiceCollection Services => Builder.Services;
    
    public virtual void RegisterModule()
    {
        RegisterDbContext();
        RegisterUsecases();
        var moduleAssembly = Assembly.Load(Key);
        RegisterUsecasesViaAttributeFromAssembly(moduleAssembly);
        RegisterIntemediaryServicesFromAssembly(moduleAssembly);
        RegisterEventHandlersFromAssembly(moduleAssembly);
    }

    // called after app.Build()
    public virtual void Run(WebApplication app){}

    protected virtual void RegisterDbContext()
    {
        // implement in child
    }

    protected virtual void RegisterUsecases(){}
    protected virtual void RegisterUsecasesViaAttributeFromAssembly(Assembly assembly)
    {
        var usecases = assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false })
            .Where(t => t.GetCustomAttribute<UsecaseInjectAttribute>() is not null)
            .ToList();

        foreach (var usecase in usecases)
        {
            Services.AddScoped(usecase);
        }
    }
    protected virtual void RegisterEventHandlersFromAssembly(Assembly assembly)
    {
        var handlers = assembly.GetTypes()
            .Where(t =>
                t is { IsClass: true, IsAbstract: false } &&
                t.Namespace is not null &&
                t.Namespace.StartsWith(EventHandlersNamespace) &&
                t.GetInterfaces().Any(i =>
                    i.IsGenericType &&
                    i.GetGenericTypeDefinition() == typeof(IIntegrationEventHandler<>)))
            .ToList();

        foreach (var handler in handlers)
        {
            var interfaces = handler.GetInterfaces();

            foreach (var serviceType in interfaces)
            {
                Services.AddScoped(serviceType, handler);
            }
        }
    }

    protected virtual void RegisterIntemediaryServicesFromAssembly(Assembly assembly)
    {
        var handlers = assembly.GetTypes()
            .Where(t =>
                t is { IsClass: true, IsAbstract: false } &&
                t.Namespace is not null &&
                t.Namespace.StartsWith(IntermediaryServicesNamespace))
            .ToList();

        foreach (var handler in handlers)
        {
            var interfaces = handler.GetInterfaces();

            foreach (var serviceType in interfaces)
            {
                Services.AddScoped(serviceType, handler);
            }
        }
    }

    /// <summary>
    /// this is a helper method
    /// </summary>
    protected void CommonRegisterDbContext<TContext>() where TContext : DbContext
    {
        Services.AddDbContext<TContext>((sprovider, options) =>
        {   
            sprovider.GetRequiredService<IConfigureDbContextStrategy>().ConfigureDbContext(sprovider, options, Key);
        });
    }

    protected virtual void RegisterCacheService()
    {
        // use strategies pattern
    }
}
