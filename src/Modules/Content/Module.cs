using Content.Core.Usecases.FileObjects;
using Content.Core.Usecases.Menus;
using Content.Core.Usecases.MetaObjects;
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
        Services.AddScoped<GetPresignedUpload>();
        Services.AddScoped<ConfirmUpload>();

        Services.AddScoped<GetAllMenus>();
        Services.AddScoped<GetMenuByName>();
        Services.AddScoped<CreateMenu>();
        Services.AddScoped<UpdateMenu>();
        Services.AddScoped<DeleteMenu>();

        Services.AddScoped<GetAllMetaObjects>();
        Services.AddScoped<GetMetaObjectByKey>();
        Services.AddScoped<CreateMetaObject>();
        Services.AddScoped<UpdateMetaObject>();
        Services.AddScoped<DeleteMetaObject>();
    }
}

public static class ModuleConstants
{
    public const string Key = "Content";
}
