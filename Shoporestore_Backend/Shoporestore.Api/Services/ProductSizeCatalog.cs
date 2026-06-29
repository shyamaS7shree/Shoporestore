using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;
using Shoporestore.Api.Models;

namespace Shoporestore.Api.Services;

public static class ProductSizeCatalog
{
    private static readonly string[] AdultClothing = ["XS", "S", "M", "L", "XL", "2XL"];
    private static readonly string[] KidsClothing = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"];
    private static readonly string[] MenFootwear = ["6", "7", "8", "9", "10", "11"];
    private static readonly string[] WomenFootwear = ["3", "4", "5", "6", "7", "8"];
    private static readonly string[] KidsFootwear = ["1C", "2C", "3C", "4C", "5C", "1Y", "2Y"];
    private static readonly string[] BraSizes = ["32B", "34B", "36B", "38B", "34C", "36C"];

    public static string[] Parse(string? value) => string.IsNullOrWhiteSpace(value)
        ? []
        : value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public static async Task SeedAsync(ShoporeDbContext db)
    {
        var products = await db.Products.ToListAsync();
        var changed = false;
        foreach (var product in products)
        {
            var expected = string.Join(',', GetOptions(product));
            if (product.SizeOptions == expected) continue;
            product.SizeOptions = expected;
            changed = true;
        }
        if (changed) await db.SaveChangesAsync();
    }

    public static string[] GetOptions(Product product)
    {
        var text = $"{product.Name} {product.Description} {product.Category} {product.SubCategory} {product.Image}".ToLowerInvariant();
        var kids = text.Contains("kid") || text.Contains("boy") || text.Contains("girl") || text.Contains("kids%20section") || text.Contains("kids section");
        var women = text.Contains("women") || text.Contains("ladies") || text.Contains("female");
        var footwear = ContainsAny(text, "shoe", "sneaker", "footwear", "sandal", "flipflop", "flip flop", "boot", "flat", "heel", "ballerina", "slipper");

        if (footwear) return kids ? KidsFootwear : women ? WomenFootwear : MenFootwear;
        if (text.Contains(" bra") || text.StartsWith("bra")) return BraSizes;
        if (ContainsAny(text, "saree", "dupatta", "scarf", "shawl")) return [];

        var clothing = ContainsAny(text, "shirt", "t-shirt", "tshirt", "top", "dress", "jeans", "trouser", "short", "jogger", "pant", "kurta", "suit", "legging", "skirt", "palazzo", "jacket", "blazer", "coat", "shapewear", "sleepwear", "loungewear", "bodysuit", "romper", "brief", "trunk", "boxer", "vest", "thermal", "sweater", "sweatshirt");
        return clothing ? kids ? KidsClothing : AdultClothing : [];
    }

    private static bool ContainsAny(string value, params string[] terms) => terms.Any(value.Contains);
}
