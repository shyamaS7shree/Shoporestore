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
            // Do not leak the legacy automated smoke-test fixtures into a customer's order history.
            .Where(x => !x.OrderItems.Any(item => item.ProductName == "Smoke Product"))
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(ResponseMapper.ToOrderDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        var orders = BuildOrders(request, request.PaymentMethod == "cod" ? "Pending" : "Paid", null);
        if (orders.Count == 0) return BadRequest(new { error = "At least one order item is required." });

        db.Orders.AddRange(orders);
        await db.SaveChangesAsync();

        return Ok(new
        {
            order = ResponseMapper.ToOrderDto(orders[0]),
            orders = orders.Select(ResponseMapper.ToOrderDto).ToList()
        });
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

    [HttpPost("{orderId:int}/split")]
    public async Task<IActionResult> Split(int orderId, SplitOrderRequest request)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        var order = await db.Orders
            .Include(x => x.OrderItems)
            .Include(x => x.Address)
            .FirstOrDefaultAsync(x => x.Id == orderId && x.UserId == request.UserId);

        if (order is null) return NotFound(new { error = "Order not found." });

        var items = order.OrderItems.OrderBy(x => x.Id).ToList();
        if (items.Count <= 1)
        {
            return Ok(new { orders = new[] { ResponseMapper.ToOrderDto(order) } });
        }

        var originalPayment = await db.Payments.FirstOrDefaultAsync(x => x.OrderId == order.Id);
        var originalTotal = order.Total;
        var itemSubtotal = items.Sum(x => x.Price * Math.Max(1, x.Quantity));
        var totalAdjustment = originalTotal - itemSubtotal;
        var splitOrders = new List<Order> { order };

        for (var index = 1; index < items.Count; index++)
        {
            var item = items[index];
            order.OrderItems.Remove(item);

            var subtotal = item.Price * Math.Max(1, item.Quantity);
            var splitOrder = new Order
            {
                UserId = order.UserId,
                AddressId = order.AddressId,
                Address = order.Address,
                OrderNumber = OrderNumberService.Generate(),
                Status = order.Status,
                Total = subtotal,
                TotalAmount = subtotal,
                SubTotal = subtotal,
                ShippingCharge = 0,
                DiscountAmount = 0,
                PaymentId = order.PaymentId,
                PaymentMethod = order.PaymentMethod,
                CancellationReason = order.CancellationReason,
                CreatedAt = order.CreatedAt,
                UpdatedAt = DateTime.UtcNow,
                OrderItems = [item]
            };

            item.Order = splitOrder;
            splitOrders.Add(splitOrder);
            db.Orders.Add(splitOrder);

            if (originalPayment is not null)
            {
                db.Payments.Add(new Payment
                {
                    Order = splitOrder,
                    PaymentProvider = originalPayment.PaymentProvider,
                    ProviderOrderId = originalPayment.ProviderOrderId,
                    ProviderPaymentId = originalPayment.ProviderPaymentId,
                    ProviderSignature = originalPayment.ProviderSignature,
                    PaymentMethod = originalPayment.PaymentMethod,
                    Amount = subtotal,
                    Status = originalPayment.Status,
                    PaidAt = originalPayment.PaidAt,
                    CreatedAt = originalPayment.CreatedAt
                });
            }
        }

        var firstItemSubtotal = items[0].Price * Math.Max(1, items[0].Quantity);
        order.SubTotal = firstItemSubtotal;
        order.Total = Math.Max(firstItemSubtotal + totalAdjustment, 0);
        order.TotalAmount = order.Total;
        order.ShippingCharge = Math.Max(totalAdjustment, 0);
        order.DiscountAmount = Math.Max(-totalAdjustment, 0);
        order.UpdatedAt = DateTime.UtcNow;
        if (originalPayment is not null) originalPayment.Amount = order.Total;

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(new { orders = splitOrders.Select(ResponseMapper.ToOrderDto).ToList() });
    }

    internal static List<Order> BuildOrders(CreateOrderRequest request, string status, string? paymentId)
    {
        var cartSubtotal = request.Items.Sum(x => x.Price * Math.Max(1, x.Quantity));
        var orderAdjustment = Math.Max(request.Total - cartSubtotal, 0);

        return request.Items.Select((item, index) =>
        {
            var subtotal = item.Price * Math.Max(1, item.Quantity);
            var adjustment = index == 0 ? orderAdjustment : 0;
            var total = subtotal + adjustment;
            var order = new Order
            {
                UserId = request.UserId,
                AddressId = request.AddressId,
                OrderNumber = OrderNumberService.Generate(),
                Status = status,
                Total = total,
                TotalAmount = total,
                SubTotal = subtotal,
                ShippingCharge = adjustment,
                DiscountAmount = 0,
                PaymentId = paymentId,
                PaymentMethod = request.PaymentMethod
            };

            order.OrderItems =
            [
                new OrderItem
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
                    TotalPrice = subtotal
                }
            ];

            return order;
        }).ToList();
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
        var orders = OrdersController.BuildOrders(request, "Paid", request.RazorpayPaymentId);
        if (orders.Count == 0) return BadRequest(new { error = "At least one order item is required." });

        var payments = orders.Select(order => new Payment
        {
            Order = order,
            ProviderOrderId = request.RazorpayOrderId,
            ProviderPaymentId = request.RazorpayPaymentId,
            ProviderSignature = request.RazorpaySignature,
            Amount = order.Total,
            Status = "Success",
            PaidAt = DateTime.UtcNow
        }).ToList();

        db.Orders.AddRange(orders);
        db.Payments.AddRange(payments);
        await db.SaveChangesAsync();

        return Ok(new
        {
            order = ResponseMapper.ToOrderDto(orders[0]),
            orders = orders.Select(ResponseMapper.ToOrderDto).ToList(),
            payment_id = request.RazorpayPaymentId
        });
    }
}





