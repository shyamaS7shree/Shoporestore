using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;
using Shoporestore.Api.Dtos;
using Shoporestore.Api.Models;

namespace Shoporestore.Api.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController(ShoporeDbContext db) : ControllerBase
{
    [HttpGet("product/{productId:int}")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var reviews = await db.Reviews
            .Where(x => x.ProductId == productId && x.IsApproved)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                id = x.Id.ToString(),
                user_id = x.UserId.ToString(),
                product_id = x.ProductId.ToString(),
                order_item_id = x.OrderItemId.ToString(),
                rating = x.Rating,
                title = x.Title,
                comment = x.Comment,
                created_at = x.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ReviewRequest request)
    {
        if (request.Rating is < 1 or > 5) return BadRequest(new { error = "Rating must be between 1 and 5." });

        var review = new Review
        {
            UserId = request.UserId,
            ProductId = request.ProductId,
            OrderItemId = request.OrderItemId,
            Rating = request.Rating,
            Title = request.Title,
            Comment = request.Comment
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();
        return Ok(new { success = true, id = review.Id.ToString() });
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

