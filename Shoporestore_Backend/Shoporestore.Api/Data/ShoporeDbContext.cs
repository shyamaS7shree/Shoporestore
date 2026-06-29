using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Models;

namespace Shoporestore.Api.Data;

public class ShoporeDbContext(DbContextOptions<ShoporeDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();
    public DbSet<LoginOtp> LoginOtps => Set<LoginOtp>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasIndex(x => x.Phone).IsUnique().HasFilter("[Phone] IS NOT NULL");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Brand>(entity =>
        {
            entity.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(x => x.Slug).IsUnique();
            entity.Property(x => x.Price).HasPrecision(18, 2);
            entity.Property(x => x.OriginalPrice).HasPrecision(18, 2);
            entity.Property(x => x.Rating).HasPrecision(3, 2);
        });

        modelBuilder.Entity<ProductVariant>(entity =>
        {
            entity.HasIndex(x => x.Sku).IsUnique();
            entity.Property(x => x.Price).HasPrecision(18, 2);
            entity.Property(x => x.OriginalPrice).HasPrecision(18, 2);
        });

        modelBuilder.Entity<WishlistItem>(entity =>
        {
            entity.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasIndex(x => x.OrderNumber).IsUnique();
            entity.Property(x => x.Total).HasPrecision(18, 2);
            entity.Property(x => x.TotalAmount).HasPrecision(18, 2);
            entity.Property(x => x.SubTotal).HasPrecision(18, 2);
            entity.Property(x => x.ShippingCharge).HasPrecision(18, 2);
            entity.Property(x => x.DiscountAmount).HasPrecision(18, 2);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(x => x.Price).HasPrecision(18, 2);
            entity.Property(x => x.UnitPrice).HasPrecision(18, 2);
            entity.Property(x => x.TotalPrice).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.Property(x => x.Amount).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasIndex(x => new { x.UserId, x.OrderItemId })
                .IsUnique()
                .HasFilter("[OrderItemId] IS NOT NULL");
        });
    }
}



