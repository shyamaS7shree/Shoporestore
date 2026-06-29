using System.ComponentModel.DataAnnotations;

namespace Shoporestore.Api.Models;

public class Order
{
    public int Id { get; set; }
    [MaxLength(50)] public string OrderNumber { get; set; } = string.Empty;
    public int UserId { get; set; }
    public int? AddressId { get; set; }
    [MaxLength(40)] public string Status { get; set; } = "paid";
    public decimal Total { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal SubTotal { get; set; }
    public decimal ShippingCharge { get; set; }
    public decimal DiscountAmount { get; set; }
    [MaxLength(150)] public string? PaymentId { get; set; }
    [MaxLength(50)] public string? PaymentMethod { get; set; }
    [MaxLength(500)] public string? CancellationReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public User? User { get; set; }
    public Address? Address { get; set; }
    public List<OrderItem> OrderItems { get; set; } = [];
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int? ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    [MaxLength(250)] public string ProductName { get; set; } = string.Empty;
    [MaxLength(100)] public string SKU { get; set; } = string.Empty;
    [MaxLength(120)] public string? ProductBrand { get; set; }
    [MaxLength(1000)] public string? ProductImage { get; set; }
    [MaxLength(50)] public string? ProductSize { get; set; }
    [MaxLength(80)] public string? ProductColor { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public Order? Order { get; set; }
}

public class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    [MaxLength(50)] public string PaymentProvider { get; set; } = "razorpay";
    [MaxLength(150)] public string? ProviderOrderId { get; set; }
    [MaxLength(150)] public string? ProviderPaymentId { get; set; }
    [MaxLength(500)] public string? ProviderSignature { get; set; }
    [MaxLength(50)] public string? PaymentMethod { get; set; }
    public decimal Amount { get; set; }
    [MaxLength(40)] public string Status { get; set; } = "Success";
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Order? Order { get; set; }
}

public class Review
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int? OrderItemId { get; set; }
    public int Rating { get; set; }
    [MaxLength(200)] public string? Title { get; set; }
    [MaxLength(2000)] public string? Comment { get; set; }
    public string? ImageDataUrl { get; set; }
    public bool IsDemo { get; set; }
    public bool IsApproved { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class StockTransaction
{
    public int Id { get; set; }
    public int ProductVariantId { get; set; }
    public int QuantityChange { get; set; }
    [MaxLength(100)] public string Reason { get; set; } = string.Empty;
    [MaxLength(100)] public string? ReferenceId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class LoginOtp
{
    public int Id { get; set; }
    [MaxLength(20)] public string Phone { get; set; } = string.Empty;
    [MaxLength(20)] public string Otp { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}



