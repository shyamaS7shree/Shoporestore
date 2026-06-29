using System.ComponentModel.DataAnnotations;

namespace Shoporestore.Api.Models;

public class User
{
    public int Id { get; set; }
    [MaxLength(150)] public string FullName { get; set; } = string.Empty;
    [MaxLength(255)] public string Email { get; set; } = string.Empty;
    [MaxLength(20)] public string? Phone { get; set; }
    [MaxLength(500)] public string PasswordHash { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateOnly? DateOfBirth { get; set; }
    [MaxLength(20)] public string? Gender { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class Address
{
    public int Id { get; set; }
    public int UserId { get; set; }
    [MaxLength(150)] public string FullName { get; set; } = string.Empty;
    [MaxLength(20)] public string Phone { get; set; } = string.Empty;
    [MaxLength(20)] public string PinCode { get; set; } = string.Empty;
    [MaxLength(400)] public string AddressLine { get; set; } = string.Empty;
    [MaxLength(300)] public string AddressLine1 { get; set; } = string.Empty;
    [MaxLength(300)] public string? AddressLine2 { get; set; }
    [MaxLength(20)] public string PostalCode { get; set; } = string.Empty;
    [MaxLength(100)] public string City { get; set; } = string.Empty;
    [MaxLength(100)] public string State { get; set; } = string.Empty;
    [MaxLength(100)] public string Country { get; set; } = "India";
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User? User { get; set; }
}

public class Category
{
    public int Id { get; set; }
    [MaxLength(120)] public string Name { get; set; } = string.Empty;
    [MaxLength(140)] public string Slug { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Brand
{
    public int Id { get; set; }
    [MaxLength(120)] public string Name { get; set; } = string.Empty;
    [MaxLength(140)] public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class Product
{
    public int Id { get; set; }
    [MaxLength(250)] public string Name { get; set; } = string.Empty;
    [MaxLength(280)] public string Slug { get; set; } = string.Empty;
    [MaxLength(120)] public string Brand { get; set; } = "Shopore";
    [MaxLength(120)] public string Category { get; set; } = string.Empty;
    [MaxLength(120)] public string? SubCategory { get; set; }
    public string? Description { get; set; }
    [MaxLength(1000)] public string? Image { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public decimal Rating { get; set; }
    public int ReviewsCount { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public List<ProductVariant> Variants { get; set; } = [];
    public List<ProductImage> Images { get; set; } = [];
}

public class ProductVariant
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    [MaxLength(100)] public string Sku { get; set; } = string.Empty;
    [MaxLength(50)] public string? Size { get; set; }
    [MaxLength(80)] public string? Color { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public Product? Product { get; set; }
}

public class ProductImage
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    [MaxLength(1000)] public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
    public Product? Product { get; set; }
}

public class WishlistItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User? User { get; set; }
    public Product? Product { get; set; }
}


