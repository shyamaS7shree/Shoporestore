using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;
using Shoporestore.Api.Dtos;
using Shoporestore.Api.Models;
using Shoporestore.Api.Services;

namespace Shoporestore.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(ShoporeDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? category, [FromQuery] string? search)
    {
        var query = db.Products
            .Include(x => x.Variants)
            .Include(x => x.Images)
            .Where(x => x.IsActive)
            .AsQueryable();
        if (!string.IsNullOrWhiteSpace(category)) query = query.Where(x => x.Category == category || x.SubCategory == category);
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(x => x.Name.Contains(search) || x.Brand.Contains(search));

        var products = await query.OrderByDescending(x => x.CreatedAt).ToListAsync();
        return Ok(products.Select(ResponseMapper.ToProductDto).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await db.Products
            .Include(x => x.Variants)
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == id);
        return product is null ? NotFound(new { error = "Product not found." }) : Ok(ResponseMapper.ToProductDto(product));
    }

    [HttpPost]
    public async Task<IActionResult> Create(ProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name.Trim(),
            Slug = await CreateUniqueSlugAsync(request.Name),
            Brand = string.IsNullOrWhiteSpace(request.Brand) ? "Shopore" : request.Brand.Trim(),
            Category = request.Category.Trim(),
            SubCategory = request.SubCategory,
            Description = request.Description,
            Image = request.Image,
            Price = request.Price,
            OriginalPrice = request.OriginalPrice
        };

        product.Variants.Add(new ProductVariant
        {
            ProductId = product.Id,
            Sku = $"SHP-{Guid.NewGuid():N}"[..16].ToUpperInvariant(),
            Price = request.Price,
            OriginalPrice = request.OriginalPrice,
            StockQuantity = request.StockQuantity
        });

        db.Products.Add(product);
        await db.SaveChangesAsync();
        AddProductImages(product, request);
        await db.SaveChangesAsync();
        return Ok(ResponseMapper.ToProductDto(product));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ProductRequest request)
    {
        var product = await db.Products
            .Include(x => x.Variants)
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (product is null) return NotFound(new { error = "Product not found." });

        product.Name = request.Name.Trim();
        product.Slug = await CreateUniqueSlugAsync(request.Name, product.Id);
        product.Brand = string.IsNullOrWhiteSpace(request.Brand) ? product.Brand : request.Brand.Trim();
        product.Category = request.Category.Trim();
        product.SubCategory = request.SubCategory;
        product.Description = request.Description;
        product.Image = request.Image;
        product.Price = request.Price;
        product.OriginalPrice = request.OriginalPrice;
        product.UpdatedAt = DateTime.UtcNow;
        ReplaceProductImages(product, request);

        var variant = product.Variants.FirstOrDefault();
        if (variant is not null)
        {
            variant.Price = request.Price;
            variant.OriginalPrice = request.OriginalPrice;
            variant.StockQuantity = request.StockQuantity;
        }

        await db.SaveChangesAsync();
        return Ok(ResponseMapper.ToProductDto(product));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound(new { error = "Product not found." });
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new { success = true });
    }

    private static void AddProductImages(Product product, ProductRequest request)
    {
        var images = request.Images
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (!string.IsNullOrWhiteSpace(request.Image) && !images.Contains(request.Image, StringComparer.OrdinalIgnoreCase))
        {
            images.Insert(0, request.Image.Trim());
        }

        for (var i = 0; i < images.Count; i++)
        {
            product.Images.Add(new ProductImage
            {
                ProductId = product.Id,
                ImageUrl = images[i],
                IsPrimary = i == 0,
                SortOrder = i + 1
            });
        }
    }

    private static void ReplaceProductImages(Product product, ProductRequest request)
    {
        product.Images.Clear();
        AddProductImages(product, request);
    }

    private async Task<string> CreateUniqueSlugAsync(string name, int? currentProductId = null)
    {
        var baseSlug = SlugService.Create(name);
        var slug = baseSlug;
        var suffix = 2;

        while (await db.Products.AnyAsync(x => x.Slug == slug && (!currentProductId.HasValue || x.Id != currentProductId.Value)))
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }

        return slug;
    }
}

[ApiController]
[Route("api/categories")]
public class CategoriesController(ShoporeDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await db.Categories.Where(x => x.IsActive).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create(Category category)
    {
        category.Slug = string.IsNullOrWhiteSpace(category.Slug) ? SlugService.Create(category.Name) : category.Slug;
        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return Ok(category);
    }
}

[ApiController]
[Route("api/stock")]
public class StockController(ShoporeDbContext db) : ControllerBase
{
    [HttpPost("adjust")]
    public async Task<IActionResult> Adjust(StockAdjustRequest request)
    {
        var variant = await db.ProductVariants.FindAsync(request.ProductVariantId);
        if (variant is null) return NotFound(new { error = "Product variant not found." });

        variant.StockQuantity = Math.Max(0, variant.StockQuantity + request.QuantityChange);
        db.StockTransactions.Add(new StockTransaction
        {
            ProductVariantId = request.ProductVariantId,
            QuantityChange = request.QuantityChange,
            Reason = request.Reason
        });
        await db.SaveChangesAsync();

        return Ok(new { success = true, stock_quantity = variant.StockQuantity });
    }
}

