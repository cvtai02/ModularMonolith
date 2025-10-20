namespace SharedKernel.Authorization;

public static class UserClaims
{
    public const string Tenant = nameof(Tenant);
    public const string Permission = nameof(Permission);
}

public static class RoleClaims
{
    public const string Permission = nameof(Permission);
}