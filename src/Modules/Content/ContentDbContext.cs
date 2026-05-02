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
    public DbSet<BlogPostCollection> BlogPostCollections => Set<BlogPostCollection>();
    public DbSet<BlogPostCollectionItem> BlogPostCollectionItems => Set<BlogPostCollectionItem>();
    public DbSet<MetaObject> MetaObjects => Set<MetaObject>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BlogPost>()
            .HasIndex(x => new { x.TenantId, x.Slug })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        modelBuilder.Entity<BlogPostCollection>()
            .HasIndex(x => new { x.TenantId, x.Key })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        modelBuilder.Entity<BlogPostCollectionItem>()
            .HasOne(x => x.BlogPostCollection)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.BlogPostCollectionId);

        modelBuilder.Entity<BlogPostCollectionItem>()
            .HasOne(x => x.BlogPost)
            .WithMany()
            .HasForeignKey(x => x.BlogPostId);

        modelBuilder.Entity<BlogPostCollectionItem>()
            .HasIndex(x => new { x.TenantId, x.BlogPostCollectionId, x.BlogPostId })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        modelBuilder.Entity<BlogPostCollectionItem>()
            .HasIndex(x => new { x.TenantId, x.BlogPostCollectionId, x.DisplayOrder })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");
    }
}
