using Identity.Api;
using Identity.Core.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SharedKernel.Abstractions.Contracts;
using SharedKernel.Abstractions.Factories;

namespace Identity;

public class IdentityModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;
    public override void RegisterModule()
    {
        Services.AddDbContext<IdentityDbContext>((sprovider, options) =>
        {
            sprovider.GetRequiredService<IConfigureDbContextStrategy>().ConfigureDbContext(sprovider, options, Key);
        });

        Services.AddIdentityApiEndpoints<AppUser>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<IdentityDbContext>()
            .AddDefaultTokenProviders();

        Services.Configure<IdentityOptions>(options =>
        {
            // Password settings.
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 6;
            options.Password.RequiredUniqueChars = 1;

            // Lockout settings.
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            // User settings.
            options.User.AllowedUserNameCharacters =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+*";
            options.User.RequireUniqueEmail = false;
        });
    }

    public override void Run(WebApplication app)
    {
        app.MapIdentityApi<AppUser>();
        app.AddIdentityModuleEnpoints();
    }
}

public static class ModuleConstants
{
    public const string Key = "Identity";
}
