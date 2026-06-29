using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;
using Shoporestore.Api.Dtos;
using Shoporestore.Api.Models;
using Shoporestore.Api.Services;

namespace Shoporestore.Api.Controllers;

[ApiController]
[Route("api/addresses")]
public class AddressesController(ShoporeDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery(Name = "user_id")] int userId)
    {
        var addresses = await db.Addresses
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(addresses.Select(ResponseMapper.ToAddressDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(AddressRequest request)
    {
        if (!await db.Users.AnyAsync(x => x.Id == request.UserId))
            return NotFound(new { error = "User not found." });

        var address = new Address
        {
            UserId = request.UserId,
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            PinCode = request.PinCode.Trim(),
            AddressLine = request.AddressLine.Trim(),
            AddressLine1 = request.AddressLine.Trim(),
            PostalCode = request.PinCode.Trim(),
            City = request.City.Trim(),
            State = request.State.Trim()
        };

        db.Addresses.Add(address);
        await db.SaveChangesAsync();
        return Ok(ResponseMapper.ToAddressDto(address));
    }
}

[ApiController]
[Route("api/profile")]
public class ProfileController(ShoporeDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery(Name = "user_id")] int userId)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound(new { error = "User not found." });

        return Ok(new
        {
            id = user.Id.ToString(),
            name = user.FullName,
            email = user.Email,
            phone = user.Phone,
            date_of_birth = user.DateOfBirth,
            gender = user.Gender
        });
    }

    [HttpPatch]
    public async Task<IActionResult> Update(ProfileUpdateRequest request)
    {
        var user = await db.Users.FindAsync(request.UserId);
        if (user is null) return NotFound(new { error = "User not found." });

        user.FullName = request.Name.Trim();
        user.Phone = request.Phone;
        user.DateOfBirth = request.DateOfBirth;
        user.Gender = request.Gender;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id.ToString(),
            name = user.FullName,
            email = user.Email,
            phone = user.Phone,
            date_of_birth = user.DateOfBirth,
            gender = user.Gender
        });
    }
}



