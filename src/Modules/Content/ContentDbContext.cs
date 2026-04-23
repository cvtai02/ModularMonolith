using Microsoft.EntityFrameworkCore;
using Content.Core.Entities;
using SharedKernel.Abstractions.Services;

namespace Content;

public class ContentDbContext: TenancyDbContext
{
    public ContentDbContext(DbContextOptions<ContentDbContext> options, ITenant? tenant) : base (options, tenant){}
    public DbSet<FileObject> Files => Set<FileObject>();
    public DbSet<Menu> Menus => Set<Menu>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<MetaObject> MetaObjects => Set<MetaObject>();
}
