using SharedKernel.Abstractions.Services;

namespace AppHost.Specifications;

public class EndpointModuleKeyRetriever : IModuleKeyRetrievable
{
    public string? Key { get; set; }
    public EndpointModuleKeyRetriever(IHttpContextAccessor h)
    {
        var path = h.HttpContext?.Request.Path.Value;
        if (path != null && path.StartsWith("/api/"))
        {
            Key = path["/api/".Length..].Split('/')[0];
        }
    }
    public string? GetModuleKey()
    {
        return Key;
    }
}