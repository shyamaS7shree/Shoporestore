using System.Text.Json.Serialization;

namespace Shoporestore.Api.Dtos;

public record RegisterRequest(string FullName, string Email, string Password, string? Phone);
public record LoginRequest(string Email, string Password);
public record PhoneLoginRequest(string Phone, string Password);
public record OtpRequest(string Phone);
public record OtpVerifyRequest(string Phone, string Otp);
public record ResetPasswordRequest(string Phone, string Email, string Password, string ConfirmPassword);

public record UserDto(
    string Id,
    string FullName,
    string Name,
    string Email,
    string? Phone
);

public class AddressRequest
{
    [JsonPropertyName("user_id")] public int UserId { get; set; }
    [JsonPropertyName("full_name")] public string FullName { get; set; } = string.Empty;
    [JsonPropertyName("phone")] public string Phone { get; set; } = string.Empty;
    [JsonPropertyName("pin_code")] public string PinCode { get; set; } = string.Empty;
    [JsonPropertyName("address_line")] public string AddressLine { get; set; } = string.Empty;
    [JsonPropertyName("city")] public string City { get; set; } = string.Empty;
    [JsonPropertyName("state")] public string State { get; set; } = string.Empty;
}

public class ProfileUpdateRequest
{
    [JsonPropertyName("user_id")] public int UserId { get; set; }
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("phone")] public string? Phone { get; set; }
    [JsonPropertyName("date_of_birth")] public DateOnly? DateOfBirth { get; set; }
    [JsonPropertyName("gender")] public string? Gender { get; set; }
}

public class OrderItemRequest
{
    [JsonPropertyName("product_id")] public string? ProductId { get; set; }
    [JsonPropertyName("brand")] public string? Brand { get; set; }
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("image")] public string? Image { get; set; }
    [JsonPropertyName("size")] public string? Size { get; set; }
    [JsonPropertyName("color")] public string? Color { get; set; }
    [JsonPropertyName("quantity")] public int Quantity { get; set; }
    [JsonPropertyName("price")] public decimal Price { get; set; }
}

public class CreateOrderRequest
{
    [JsonPropertyName("user_id")] public int UserId { get; set; }
    [JsonPropertyName("user_email")] public string? UserEmail { get; set; }
    [JsonPropertyName("user_name")] public string? UserName { get; set; }
    [JsonPropertyName("total")] public decimal Total { get; set; }
    [JsonPropertyName("items")] public List<OrderItemRequest> Items { get; set; } = [];
    [JsonPropertyName("address_id")] public int? AddressId { get; set; }
    [JsonPropertyName("payment_method")] public string? PaymentMethod { get; set; }
}

public class CancelOrderRequest
{
    [JsonPropertyName("order_id")] public int OrderId { get; set; }
    [JsonPropertyName("user_id")] public int UserId { get; set; }
    [JsonPropertyName("user_email")] public string? UserEmail { get; set; }
    [JsonPropertyName("user_name")] public string? UserName { get; set; }
    [JsonPropertyName("cancellation_reason")] public string? CancellationReason { get; set; }
}

public record CreatePaymentOrderRequest(decimal Amount);

public class VerifyPaymentRequest : CreateOrderRequest
{
    [JsonPropertyName("razorpay_order_id")] public string RazorpayOrderId { get; set; } = string.Empty;
    [JsonPropertyName("razorpay_payment_id")] public string RazorpayPaymentId { get; set; } = string.Empty;
    [JsonPropertyName("razorpay_signature")] public string RazorpaySignature { get; set; } = string.Empty;
}

public class ProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public string? Description { get; set; }
    public string? Image { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int StockQuantity { get; set; }
    [JsonPropertyName("images")] public List<string> Images { get; set; } = [];
}

public class WishlistItemRequest
{
    [JsonPropertyName("user_id")] public int UserId { get; set; }
    [JsonPropertyName("product_id")] public int ProductId { get; set; }
}

public class ReviewRequest
{
    [JsonPropertyName("user_id")] public int UserId { get; set; }
    [JsonPropertyName("product_id")] public int ProductId { get; set; }
    [JsonPropertyName("order_item_id")] public int? OrderItemId { get; set; }
    [JsonPropertyName("rating")] public int Rating { get; set; }
    [JsonPropertyName("title")] public string? Title { get; set; }
    [JsonPropertyName("comment")] public string? Comment { get; set; }
}

public class StockAdjustRequest
{
    [JsonPropertyName("product_variant_id")] public int ProductVariantId { get; set; }
    [JsonPropertyName("quantity_change")] public int QuantityChange { get; set; }
    [JsonPropertyName("reason")] public string Reason { get; set; } = "manual";
}

public class ContactRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? OrderNo { get; set; }
    public string? Subject { get; set; }
    public string? Message { get; set; }
}

public class ChatRequest
{
    [JsonPropertyName("message")] public string Message { get; set; } = string.Empty;
    [JsonPropertyName("user_id")] public string? UserId { get; set; }
    [JsonPropertyName("user_email")] public string? UserEmail { get; set; }
    [JsonPropertyName("user_phone")] public string? UserPhone { get; set; }
}

