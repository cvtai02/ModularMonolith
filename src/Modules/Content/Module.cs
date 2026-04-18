using Microsoft.Extensions.Hosting;

namespace Content;

public class ContentModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;
    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<ContentDbContext>();
    }
}

public static class ModuleConstants
{
    public const string Key = "Content";
}
