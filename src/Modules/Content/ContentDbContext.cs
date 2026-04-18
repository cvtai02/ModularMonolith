using Microsoft.EntityFrameworkCore;
using Content.Core.Entities;
using SharedKernel.Abstractions.Services;

namespace Content;

public class ContentDbContext: TenancyDbContext
{
    public ContentDbContext(DbContextOptions<ContentDbContext> options, IUser? user) : base (options, user){}
    public DbSet<ContentFile> Files => Set<ContentFile>();
    public DbSet<Menu> Menus => Set<Menu>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<MetaObject> MetaObjects => Set<MetaObject>();
}
