using System.Security.Claims;
using SharedKernel.Abstractions.Services;

namespace AppHost.Specifications;

public class User(IHttpContextAccessor httpContextAccessor) : IUser
{
    public string Id => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
    public string? UserName => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);
    public string? Email => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);
    public string? FullName => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.GivenName);
    public int? TenantId => 0;
}

