using Account.Api.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using SharedKernel.Authorization;

namespace Account;

public class AccountModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<AccountDbContext>();
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
