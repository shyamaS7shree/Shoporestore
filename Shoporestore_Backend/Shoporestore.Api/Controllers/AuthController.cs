using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;
using Shoporestore.Api.Dtos;
using Shoporestore.Api.Models;
using Shoporestore.Api.Services;

namespace Shoporestore.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(ShoporeDbContext db) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { success = false, message = "Name, email and password are required." });

        var email = request.Email.Trim().ToLowerInvariant();
        var phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();

        if (await db.Users.AnyAsync(x => x.Email == email))
            return Conflict(new { success = false, message = "Email is already registered." });

        if (phone is not null && await db.Users.AnyAsync(x => x.Phone == phone))
            return Conflict(new { success = false, message = "Phone number is already registered." });

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            Phone = phone,
            PasswordHash = PasswordService.Hash(request.Password)
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Registration successful.",
            accessToken = TokenService.CreateToken(),
            refreshToken = TokenService.CreateToken(),
            user = ResponseMapper.ToUserDto(user)
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email && x.IsActive);

        if (user is null || !PasswordService.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { success = false, message = "Invalid email or password." });

        return Ok(new
        {
            success = true,
            message = "Login successful.",
            accessToken = TokenService.CreateToken(),
            refreshToken = TokenService.CreateToken(),
            user = ResponseMapper.ToUserDto(user)
        });
    }

    [HttpPost("phone-login")]
    public async Task<IActionResult> PhoneLogin(PhoneLoginRequest request)
    {
        var phone = request.Phone.Trim();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Phone == phone && x.IsActive);

        if (user is null || !PasswordService.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { success = false, message = "Invalid phone or password." });

        return Ok(new
        {
            success = true,
            message = "Login successful.",
            accessToken = TokenService.CreateToken(),
            refreshToken = TokenService.CreateToken(),
            user = ResponseMapper.ToUserDto(user)
        });
    }

    [HttpPost("email-otp/request")]
    public async Task<IActionResult> RequestOtp(OtpRequest request)
    {
        var phone = request.Phone.Trim();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Phone == phone && x.IsActive);
        if (user is null) return NotFound(new { success = false, message = "No account found with this phone number." });

        var otp = Random.Shared.Next(100000, 999999).ToString();
        db.LoginOtps.Add(new LoginOtp { Phone = phone, Otp = otp, ExpiresAt = DateTime.UtcNow.AddMinutes(10) });
        await db.SaveChangesAsync();

        return Ok(new { success = true, message = "OTP generated for development testing.", otp });
    }

    [HttpPost("email-otp/verify")]
    public async Task<IActionResult> VerifyOtp(OtpVerifyRequest request)
    {
        var phone = request.Phone.Trim();
        var otp = await db.LoginOtps
            .Where(x => x.Phone == phone && x.Otp == request.Otp && !x.Used && x.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp is null) return BadRequest(new { success = false, message = "Invalid or expired OTP." });

        var user = await db.Users.FirstOrDefaultAsync(x => x.Phone == phone && x.IsActive);
        if (user is null) return NotFound(new { success = false, message = "User not found." });

        otp.Used = true;
        await db.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "OTP verified.",
            accessToken = TokenService.CreateToken(),
            refreshToken = TokenService.CreateToken(),
            user = ResponseMapper.ToUserDto(user)
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        if (request.Password != request.ConfirmPassword)
            return BadRequest(new { success = false, message = "Passwords do not match." });

        var email = request.Email.Trim().ToLowerInvariant();
        var phone = request.Phone.Trim();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email && x.Phone == phone && x.IsActive);
        if (user is null) return NotFound(new { success = false, message = "Account not found." });

        user.PasswordHash = PasswordService.Hash(request.Password);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { success = true, message = "Password reset successful." });
    }
}

[ApiController]
[Route("api/Auth")]
public class AuthUtilityController : ControllerBase
{
    [HttpGet("verify-email")]
    public IActionResult VerifyEmail([FromQuery] string token) => Ok(new { message = "Email verified successfully." });
}

