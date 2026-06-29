using Shoporestore.Api.Dtos;
using Shoporestore.Api.Models;

namespace Shoporestore.Api.Services;

public static class ResponseMapper
{
    public static UserDto ToUserDto(User user) => new(
        user.Id.ToString(),
        user.FullName,
        user.FullName,
        user.Email,
        user.Phone
    );

    public static object ToAddressDto(Address address) => new
    {
        id = address.Id.ToString(),
        user_id = address.UserId.ToString(),
        full_name = address.FullName,
        phone = address.Phone,
        pin_code = address.PinCode,
        address_line = address.AddressLine,
        city = address.City,
        state = address.State,
        country = address.Country,
        is_default = address.IsDefault,
        created_at = address.CreatedAt
    };

    public static object ToOrderDto(Order order) => new
    {
        id = order.Id.ToString(),
        order_number = order.OrderNumber,
        user_id = order.UserId.ToString(),
        address_id = order.AddressId?.ToString(),
        total = order.Total,
        status = order.Status.ToLowerInvariant(),
        payment_id = order.PaymentId,
        payment_method = order.PaymentMethod,
        created_at = order.CreatedAt,
        updated_at = order.UpdatedAt,
        delivery_address = order.Address is null ? null : ToAddressDto(order.Address),
        order_items = order.OrderItems.Select(ToOrderItemDto).ToList()
    };

    public static object ToOrderItemDto(OrderItem item) => new
    {
        id = item.Id.ToString(),
        order_id = item.OrderId.ToString(),
        product_id = item.ProductId?.ToString(),
        product_variant_id = item.ProductVariantId?.ToString(),
        product_name = item.ProductName,
        product_brand = item.ProductBrand,
        product_image = item.ProductImage,
        product_size = item.ProductSize,
        product_color = item.ProductColor,
        quantity = item.Quantity,
        price = item.Price
    };

    public static object ToProductDto(Product product) => new
    {
        id = product.Id.ToString(),
        name = product.Name,
        slug = product.Slug,
        brand = product.Brand,
        category = product.Category,
        subCategory = product.SubCategory,
        description = product.Description,
        image = GetPrimaryImage(product),
        price = product.Price,
        originalPrice = product.OriginalPrice,
        rating = product.Rating,
        reviews = product.ReviewsCount,
        isActive = product.IsActive,
        images = product.Images
            .OrderByDescending(x => x.IsPrimary)
            .ThenBy(x => x.SortOrder)
            .Select(x => x.ImageUrl)
            .ToList(),
        variants = product.Variants.Select(v => new
        {
            id = v.Id.ToString(),
            product_id = v.ProductId.ToString(),
            sku = v.Sku,
            size = v.Size,
            color = v.Color,
            price = v.Price,
            original_price = v.OriginalPrice,
            stock_quantity = v.StockQuantity,
            is_active = v.IsActive
        }).ToList()
    };

    public static object ToWishlistItemDto(WishlistItem item)
    {
        var product = item.Product;
        var department = product is null ? "shop" : GetDepartment(product);
        var image = product is null ? string.Empty : GetPrimaryImage(product);

        return new
        {
            id = product is null ? item.ProductId.ToString() : $"{department}-{product.Id}",
            wishlist_item_id = item.Id.ToString(),
            user_id = item.UserId.ToString(),
            product_id = item.ProductId.ToString(),
            brand = product?.Brand ?? "Shopore",
            name = product?.Name ?? "Product",
            image,
            price = product?.Price ?? 0,
            originalPrice = product?.OriginalPrice,
            department,
            category = product?.Category,
            subCategory = product?.SubCategory,
            href = product is null ? $"/products/{item.ProductId}" : $"/products/{product.Id}"
        };
    }

    private static string GetPrimaryImage(Product product)
    {
        return product.Images
            .OrderByDescending(x => x.IsPrimary)
            .ThenBy(x => x.SortOrder)
            .Select(x => x.ImageUrl)
            .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x))
            ?? product.Image
            ?? string.Empty;
    }

    private static string GetDepartment(Product product)
    {
        var value = $"{product.Category} {product.SubCategory} {product.Image}".ToLowerInvariant();
        if (value.Contains("women")) return "women";
        if (value.Contains("kid") || value.Contains("boy") || value.Contains("girl")) return "kids";
        if (value.Contains("home")) return "home";
        if (value.Contains("beauty")) return "beauty";
        if (value.Contains("genz")) return "genz";
        return "men";
    }
}


