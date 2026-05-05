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
        RegisterEventHandlersFromAssembly(moduleAssembly);
    }

    // called after app.Build()
    public virtual void Run(WebApplication app){}

    protected virtual void RegisterDbContext()
    {
        // implement in child
    }

    protected virtual void RegisterUsecases(){}
    protected virtual void RegisterUsercasesViaAttributeFromAssembly(Assembly assembly)
    {
        var usecases = assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false })
            .Select(t => new
            {
                ImplementationType = t,
                Attribute = t.GetCustomAttribute<UsecaseInjectAttribute>()
            })
            .Where(x => x.Attribute is not null)
            .ToList();

        foreach (var usecase in usecases)
        {
            var serviceType = usecase.Attribute!.ServiceType ?? usecase.ImplementationType;
            if (!serviceType.IsAssignableFrom(usecase.ImplementationType))
            {
                throw new InvalidOperationException(
                    $"{usecase.ImplementationType.FullName} cannot be registered as {serviceType.FullName}.");
            }

            var descriptor = usecase.Attribute.Lifetime switch
            {
                UsecaseInjectLifetime.Scoped => ServiceDescriptor.Scoped(serviceType, usecase.ImplementationType),
                UsecaseInjectLifetime.Transient => ServiceDescriptor.Transient(serviceType, usecase.ImplementationType),
                UsecaseInjectLifetime.Singleton => ServiceDescriptor.Singleton(serviceType, usecase.ImplementationType),
                _ => throw new ArgumentOutOfRangeException(nameof(usecase.Attribute.Lifetime))
            };

            Services.Add(descriptor);
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
                t.Namespace.StartsWith(IntermediaryServicesNamespace) &&
                t.GetInterfaces().Any(i =>
                    i.IsGenericType &&
                    i.GetGenericTypeDefinition() == typeof(IIntegrationEventHandler<>)))
            .ToList();

        foreach (var handler in handlers)
        {
            var interfaces = handler.GetInterfaces()
                .Where(i =>
                    i.IsGenericType &&
                    i.GetGenericTypeDefinition() == typeof(IIntegrationEventHandler<>));

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
