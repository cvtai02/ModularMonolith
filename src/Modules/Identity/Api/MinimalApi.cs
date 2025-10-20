using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace Identity.Api;

public static class WebApplicationExtensions
{
    extension(WebApplication app)
    {
        public void AddIdentityModuleEnpoints()
        {
            app.MapGet("/me", (ClaimsPrincipal user) =>
            {
                return Results.Ok(new
                {
                    Email = user.FindFirstValue(ClaimTypes.Email),
                    Role = user.FindFirstValue(ClaimTypes.Role),
                    Name = user.FindFirstValue(ClaimTypes.Name)
                });
            }).Produces<UserInfo>(200).RequireAuthorization();
        }
    }
}

public class UserInfo
{
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public string Name { get; set; } = "";
}