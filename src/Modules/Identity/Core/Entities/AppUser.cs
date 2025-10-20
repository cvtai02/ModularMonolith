using Microsoft.AspNetCore.Identity;

namespace Identity.Core.Entities;

public class AppUser : IdentityUser
{
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
}
