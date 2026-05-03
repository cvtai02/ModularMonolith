using Account.Api.Hubs;
using Account.Core.EventHandlers;
using Account.Core.Services;
using Account.Core.Usecases;
using Intermediary.Events.Order;
using Intermediary.Ordering;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SharedKernel.Abstractions.Contracts;
using SharedKernel.Authorization;

namespace Account;

public class AccountModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    public override void RegisterModule()
    {
        base.RegisterModule();
        RegisterUsecases();
    }

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<AccountDbContext>();
    }

    protected override void RegisterUsecases()
    {
        Services.AddScoped<AccountProfileResolver>();
        Services.AddScoped<GetMyAccountProfile>();
        Services.AddScoped<UpdateMyAccountProfile>();
        Services.AddScoped<ListMyAccountAddresses>();
        Services.AddScoped<CreateMyAccountAddress>();
        Services.AddScoped<UpdateMyAccountAddress>();
        Services.AddScoped<DeleteMyAccountAddress>();
        Services.AddScoped<ListAdminAccountProfiles>();
        Services.AddScoped<GetAdminAccountProfileById>();
        Services.AddScoped<UpdateAdminAccountProfile>();
        Services.AddScoped<IOrderCustomerLookup, OrderCustomerLookup>();
        Services.AddScoped<IEventHandler<AdminOrderPlaced>, AdminOrderPlacedHandler>();
    }

    public override void Run(WebApplication app)
    {
        app.MapHub<NotificationHub>("/hubs/notifications").RequireAuthorization(Policies.TenantAdminUp);
    }
}

public static class ModuleConstants
{
    public const string Key = "Account";
}
