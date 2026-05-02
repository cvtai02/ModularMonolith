using Content.Core.Usecases.BlogPosts;
using Content.Core.Usecases.BlogPostCollections;
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
        Services.AddScoped<BlogPostSlugGenerator>();
        Services.AddScoped<ListPublishedBlogPosts>();
        Services.AddScoped<GetPublishedBlogPostBySlug>();
        Services.AddScoped<ListAdminBlogPosts>();
        Services.AddScoped<GetAdminBlogPostById>();
        Services.AddScoped<CreateBlogPost>();
        Services.AddScoped<UpdateBlogPost>();
        Services.AddScoped<PublishBlogPost>();
        Services.AddScoped<ArchiveBlogPost>();
        Services.AddScoped<DeleteBlogPost>();
        Services.AddScoped<GetPublicBlogPostCollectionByKey>();
        Services.AddScoped<ListAdminBlogPostCollections>();
        Services.AddScoped<GetAdminBlogPostCollectionById>();
        Services.AddScoped<CreateBlogPostCollection>();
        Services.AddScoped<UpdateBlogPostCollection>();
        Services.AddScoped<DeleteBlogPostCollection>();
    }
}

public static class ModuleConstants
{
    public const string Key = "Content";
}
