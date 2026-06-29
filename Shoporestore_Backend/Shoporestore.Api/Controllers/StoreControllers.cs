using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;
using Shoporestore.Api.Dtos;
using Shoporestore.Api.Models;
using Shoporestore.Api.Services;

namespace Shoporestore.Api.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController(ShoporeDbContext db) : ControllerBase
{
    [HttpGet("product/{productId:int}")]
    public async Task<IActionResult> GetByProduct(int productId, [FromQuery(Name = "user_id")] int? userId)
    {
        var product = await db.Products.FindAsync(productId);
        if (product is null) return NotFound(new { error = "Product not found." });

        var reviews = await db.Reviews
            .Where(x => x.ProductId == productId && x.IsApproved)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var userIds = reviews.Select(x => x.UserId).Distinct().ToList();
        var userNames = await db.Users
            .Where(x => userIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, x => x.FullName);
        var verifiedOrderItemIds = (await db.OrderItems
            .Where(x => x.ProductImage == product.Image ||
                ((x.ProductImage == null || x.ProductImage == "") && x.ProductId == productId))
            .Select(x => x.Id)
            .ToListAsync())
            .ToHashSet();

        int? eligibleOrderItemId = null;
        if (userId.HasValue)
        {
            eligibleOrderItemId = await db.OrderItems
                .Where(x => (x.ProductImage == product.Image ||
                    ((x.ProductImage == null || x.ProductImage == "") && x.ProductId == productId)) &&
                    x.Order != null && x.Order.UserId == userId.Value)
                .Where(x => x.Order != null && x.Order.Status != "Cancelled" && x.Order.Status != "Refunded")
                .Where(x => !db.Reviews.Any(review => review.UserId == userId.Value && review.OrderItemId == x.Id))
                .OrderByDescending(x => x.Id)
                .Select(x => (int?)x.Id)
                .FirstOrDefaultAsync();
        }

        var displayedRatings = reviews.Select(x => x.Rating).ToList();
        var total = displayedRatings.Count;
        var average = total == 0 ? 0 : Math.Round(displayedRatings.Average(), 1);
        var breakdown = Enumerable.Range(1, 5).ToDictionary(
            rating => rating.ToString(),
            rating => displayedRatings.Count(value => value == rating));
        var currentUserReview = userId.HasValue ? reviews.FirstOrDefault(x => x.UserId == userId.Value) : null;
        var reviewDtos = reviews.Select(x => new
            {
                id = x.Id.ToString(),
                user_id = x.UserId.ToString(),
                user_name = userNames.GetValueOrDefault(x.UserId, "Shopore customer"),
                product_id = x.ProductId.ToString(),
                order_item_id = x.OrderItemId?.ToString(),
                rating = x.Rating,
                title = x.Title,
                comment = x.Comment,
                verified_purchase = x.OrderItemId.HasValue && verifiedOrderItemIds.Contains(x.OrderItemId.Value),
                is_mine = userId.HasValue && x.UserId == userId.Value,
                is_demo = x.IsDemo,
                review_image = x.ImageDataUrl,
                created_at = x.CreatedAt,
                updated_at = x.UpdatedAt
            }).ToList();

        return Ok(new
        {
            summary = new { average, total, breakdown },
            can_review = eligibleOrderItemId.HasValue || currentUserReview is not null,
            order_item_id = (eligibleOrderItemId ?? currentUserReview?.OrderItemId)?.ToString(),
            user_review = currentUserReview is not null
                ? new
                {
                    id = currentUserReview.Id.ToString(),
                    rating = currentUserReview.Rating,
                    title = currentUserReview.Title,
                    comment = currentUserReview.Comment,
                    review_image = currentUserReview.ImageDataUrl
                }
                : null,
            reviews = reviewDtos
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(ReviewRequest request)
    {
        if (request.Rating is < 1 or > 5) return BadRequest(new { error = "Rating must be between 1 and 5." });
        if (string.IsNullOrWhiteSpace(request.Comment) || request.Comment.Trim().Length < 10)
            return BadRequest(new { error = "Review must be at least 10 characters." });

        var product = await db.Products.FindAsync(request.ProductId);
        if (product is null) return NotFound(new { error = "Product not found." });

        var orderItem = await db.OrderItems
            .Include(x => x.Order)
            .FirstOrDefaultAsync(x =>
                x.Id == request.OrderItemId &&
                (x.ProductImage == product.Image ||
                    ((x.ProductImage == null || x.ProductImage == "") && x.ProductId == request.ProductId)) &&
                x.Order != null &&
                x.Order.UserId == request.UserId);

        if (orderItem is null)
            return BadRequest(new { error = "Only customers who purchased this product can review it." });
        if (orderItem.Order?.Status is "Cancelled" or "Refunded")
            return BadRequest(new { error = "Cancelled or refunded purchases cannot be reviewed." });

        // Repair legacy order items that were saved with a local frontend catalog id.
        orderItem.ProductId = request.ProductId;

        var review = await db.Reviews.FirstOrDefaultAsync(x =>
            x.UserId == request.UserId && x.OrderItemId == orderItem.Id);

        if (review is null)
        {
            review = new Review
            {
                UserId = request.UserId,
                ProductId = request.ProductId,
                OrderItemId = orderItem.Id
            };
            db.Reviews.Add(review);
        }

        review.Rating = request.Rating;
        review.Title = string.IsNullOrWhiteSpace(request.Title) ? null : request.Title.Trim();
        review.Comment = request.Comment.Trim();
        review.ImageDataUrl = string.IsNullOrWhiteSpace(request.ImageDataUrl) ? null : request.ImageDataUrl;
        review.IsApproved = true;
        review.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        await UpdateProductRatingAsync(request.ProductId);
        return Ok(new { success = true, id = review.Id.ToString(), message = "Review saved successfully." });
    }

    private async Task UpdateProductRatingAsync(int productId)
    {
        var product = await db.Products.FindAsync(productId);
        if (product is null) return;

        var ratings = await db.Reviews
            .Where(x => x.ProductId == productId && x.IsApproved)
            .Select(x => x.Rating)
            .ToListAsync();
        product.ReviewsCount = ratings.Count;
        product.Rating = ratings.Count == 0 ? 0 : Math.Round((decimal)ratings.Average(), 2);
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }
}

[ApiController]
[Route("api/pincode")]
public class PincodeController : ControllerBase
{
    [HttpGet("{pin}")]
    public IActionResult Lookup(string pin)
    {
        if (pin.Length != 6 || !pin.All(char.IsDigit))
            return BadRequest(new { error = "Invalid PIN code." });

        return Ok(new
        {
            pin,
            name = "Delivery location",
            district = "Kolkata",
            state = "West Bengal",
            country = "India",
            deliveryStatus = "Delivery available"
        });
    }
}

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    [HttpPost]
    public IActionResult Send(ContactRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Email and message are required." });

        return Ok(new { success = true, message = "Message received. Email sending will be added in the production mail service." });
    }
}

[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    [HttpPost]
    public IActionResult Chat(ChatRequest request)
    {
        var text = request.Message.ToLowerInvariant();
        var answer = text switch
        {
            var x when x.Contains("order") => "You can check orders from Profile > My Orders. Live order lookup is connected to the Orders API.",
            var x when x.Contains("refund") => "Refunds normally start after cancellation or return approval. Check the order details page for status.",
            var x when x.Contains("return") => "Eligible delivered products can be returned from the order details page.",
            var x when x.Contains("payment") => "Payments are handled through the payment endpoints and verified before order confirmation.",
            _ => "I can help with Shopore products, orders, payments, returns, delivery, and account questions."
        };

        return Ok(new { answer });
    }
}
[ApiController]
[Route("api/subscriber")]
public class SubscriberController : ControllerBase
{
    [HttpPost("subscribe")]
    public IActionResult Subscribe([FromBody] SubscriberRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { success = false, message = "Email is required." });

        return Ok(new { success = true, message = "Subscribed successfully." });
    }
}

public class SubscriberRequest
{
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
}

