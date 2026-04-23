using Cart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;

namespace Cart;

public class CartDbContext : TenancyDbContext
{
    public CartDbContext(DbContextOptions<CartDbContext> options, ITenant? tenant) : base(options, tenant)
    {
    }

    public DbSet<Core.Entities.Cart> Carts => Set<Core.Entities.Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
}
