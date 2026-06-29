using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;
using Shoporestore.Api.Dtos;
using Shoporestore.Api.Models;
using Shoporestore.Api.Services;

namespace Shoporestore.Api.Controllers;

[ApiController]
[Route("api/wishlist")]
public class WishlistController(ShoporeDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery(Name = "user_id")] int userId)
    {
        if (userId <= 0) return BadRequest(new { error = "Valid user_id is required." });

        var items = await db.WishlistItems
            .Include(x => x.Product)
            .ThenInclude(x => x!.Images)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(items.Select(ResponseMapper.ToWishlistItemDto).ToList());
    }

    [HttpPost]
    public async Task<IActionResult> Add(WishlistItemRequest request)
    {
        if (request.UserId <= 0 || request.ProductId <= 0)
        {
            return BadRequest(new { error = "Valid user_id and product_id are required." });
        }

        var productExists = await db.Products.AnyAsync(x => x.Id == request.ProductId && x.IsActive);
        if (!productExists) return NotFound(new { error = "Product not found." });

        var item = await db.WishlistItems
            .Include(x => x.Product)
            .ThenInclude(x => x!.Images)
            .FirstOrDefaultAsync(x => x.UserId == request.UserId && x.ProductId == request.ProductId);

        if (item is null)
        {
            item = new WishlistItem
            {
                UserId = request.UserId,
                ProductId = request.ProductId
            };
            db.WishlistItems.Add(item);
            await db.SaveChangesAsync();

            item = await db.WishlistItems
                .Include(x => x.Product)
                .ThenInclude(x => x!.Images)
                .FirstAsync(x => x.Id == item.Id);
        }

        return Ok(ResponseMapper.ToWishlistItemDto(item));
    }

    [HttpDelete]
    public async Task<IActionResult> Remove(
        [FromQuery(Name = "user_id")] int userId,
        [FromQuery(Name = "product_id")] int productId)
    {
        if (userId <= 0 || productId <= 0)
        {
            return BadRequest(new { error = "Valid user_id and product_id are required." });
        }

        var item = await db.WishlistItems.FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId);
        if (item is not null)
        {
            db.WishlistItems.Remove(item);
            await db.SaveChangesAsync();
        }

        return Ok(new { success = true });
    }
}
