using Microsoft.AspNetCore.Authorization;

namespace SharedKernel.Authorization;

public static class Policies
{
   public const string AdminOnly = nameof(AdminOnly);
   public const string TenantAdminUp = nameof(TenantAdminUp);
   public const string TenantModeratorUp = nameof(TenantModeratorUp);
   public const string AuthenticatedUserUp = nameof(AuthenticatedUserUp);

   internal static readonly Dictionary<string, Action<AuthorizationPolicyBuilder>> Configurations = new()
   {
      [AdminOnly] = policy => policy.RequireRole(Roles.TenantAdmin),
      [TenantAdminUp] = policy => policy.RequireRole(Roles.TenantAdmin, Roles.TenantAdmin),
      [TenantModeratorUp] = policy => policy.RequireRole(Roles.TenantAdmin, Roles.TenantAdmin, Roles.TenantModerator),
      [AuthenticatedUserUp] = policy => policy.RequireAuthenticatedUser(),
   };
}

public static partial class AuthorizationOptionsExtension
{
   extension(AuthorizationOptions options)
   {
      public void AddPolicies()
      {
         foreach (var (name, configure) in Policies.Configurations)
            options.AddPolicy(name, configure);
      }
   }
}