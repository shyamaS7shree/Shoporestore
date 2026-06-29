using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;
using Shoporestore.Api.Dtos;
using Shoporestore.Api.Models;
using Shoporestore.Api.Services;

namespace Shoporestore.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(ShoporeDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery(Name = "user_id")] int userId)
    {
        var orders = await db.Orders
            .Include(x => x.OrderItems)
            .Include(x => x.Address)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(ResponseMapper.ToOrderDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        var order = BuildOrder(request, request.PaymentMethod == "cod" ? "Pending" : "Paid", null);
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        return Ok(new { order = ResponseMapper.ToOrderDto(order) });
    }

    [HttpPatch]
    public async Task<IActionResult> Cancel(CancelOrderRequest request)
    {
        var order = await db.Orders
            .Include(x => x.OrderItems)
            .Include(x => x.Address)
            .FirstOrDefaultAsync(x => x.Id == request.OrderId && x.UserId == request.UserId);

        if (order is null) return NotFound(new { error = "Order not found." });
        if (order.Status is "Cancelled" or "Refunded" or "Delivered")
            return BadRequest(new { error = "This order cannot be cancelled." });

        order.Status = "Cancelled";
        order.CancellationReason = request.CancellationReason;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { order = ResponseMapper.ToOrderDto(order) });
    }

    internal static Order BuildOrder(CreateOrderRequest request, string status, string? paymentId)
    {
        var subtotal = request.Items.Sum(x => x.Price * Math.Max(1, x.Quantity));
        var total = request.Total > 0 ? request.Total : subtotal;
        var order = new Order
        {
            UserId = request.UserId,
            AddressId = request.AddressId,
            OrderNumber = $"SHP{DateTime.UtcNow:yyyyMMddHHmmss}{Random.Shared.Next(1000, 9999)}",
            Status = status,
            Total = total,
            TotalAmount = total,
            SubTotal = subtotal,
            ShippingCharge = Math.Max(total - subtotal, 0),
            DiscountAmount = 0,
            PaymentId = paymentId,
            PaymentMethod = request.PaymentMethod
        };

        order.OrderItems = request.Items.Select(item => new OrderItem
        {
            Order = order,
            ProductId = int.TryParse(item.ProductId, out var productId) ? productId : null,
            ProductName = item.Name,
            SKU = $"SKU-{Guid.NewGuid():N}"[..16].ToUpperInvariant(),
            ProductBrand = item.Brand,
            ProductImage = item.Image,
            ProductSize = item.Size,
            ProductColor = item.Color,
            Quantity = Math.Max(1, item.Quantity),
            Price = item.Price,
            UnitPrice = item.Price,
            TotalPrice = item.Price * Math.Max(1, item.Quantity)
        }).ToList();

        return order;
    }
}

[ApiController]
[Route("api/payment")]
public class PaymentController(ShoporeDbContext db) : ControllerBase
{
    [HttpPost("create-order")]
    public IActionResult CreatePaymentOrder(CreatePaymentOrderRequest request)
    {
        var amountPaise = (int)Math.Round(request.Amount * 100, MidpointRounding.AwayFromZero);
        return Ok(new
        {
            id = $"order_{Guid.NewGuid():N}",
            amount = amountPaise,
            currency = "INR"
        });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify(VerifyPaymentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RazorpayPaymentId))
            return BadRequest(new { error = "Payment id is required." });

        request.PaymentMethod = "razorpay";
        var order = OrdersController.BuildOrder(request, "Paid", request.RazorpayPaymentId);
        var payment = new Payment
        {
            Order = order,
            ProviderOrderId = request.RazorpayOrderId,
            ProviderPaymentId = request.RazorpayPaymentId,
            ProviderSignature = request.RazorpaySignature,
            Amount = request.Total,
            Status = "Success",
            PaidAt = DateTime.UtcNow
        };

        db.Orders.Add(order);
        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        return Ok(new { order = ResponseMapper.ToOrderDto(order), payment_id = request.RazorpayPaymentId });
    }
}





