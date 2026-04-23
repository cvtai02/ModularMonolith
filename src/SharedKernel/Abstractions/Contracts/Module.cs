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
    public IHostApplicationBuilder Builder { get; } = builder;
    public IServiceCollection Services => Builder.Services;
    
    public virtual void RegisterModule()
    {
        RegisterDbContext();
        RegisterUsecases();
    }

    // called after app.Build()
    public virtual void Run(WebApplication app){}

    protected virtual void RegisterDbContext()
    {
        // implement in child
    }

    protected virtual void RegisterUsecases()
    {
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