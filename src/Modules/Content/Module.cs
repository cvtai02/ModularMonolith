using Content.Core.Usecases.FileObjects;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Content;

public class ContentModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    public override void RegisterModule()
    {
        base.RegisterModule();
        RegisterUsecases();
    }

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<ContentDbContext>();
    }

    protected override void RegisterUsecases()
    {
        Services.AddScoped<ListMediaFiles>();
        Services.AddScoped<GetPresignedUpload>();
        Services.AddScoped<ConfirmUpload>();
        Services.AddScoped<DeleteMediaFiles>();
    }
}

public static class ModuleConstants
{
    public const string Key = "Content";
}
