using System.Security.Claims;

namespace SharedKernel.Authorization;

public static class Roles
{
    public const string SystemAdmin = nameof(SystemAdmin);
    public const string TenantAdmin = nameof(TenantAdmin);
    public const string TenantModerator = nameof(TenantModerator);
    public const string User = nameof(User);
    public static readonly Dictionary<string, List<Claim>> Claims = new()
    {
        [SystemAdmin] = [
            new Claim(RoleClaims.Permission, Permissions.ManageRoles),
            new Claim(RoleClaims.Permission, Permissions.ManageClaims)
        ],
        [TenantAdmin] = [],
        [TenantModerator] = [],
        [User] = [],
    };

}
    