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
            .Where(x => x.UserId == userId && !x.IsDeleted)
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

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, AddressRequest request)
    {
        var address = await db.Addresses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == request.UserId && !x.IsDeleted);
        if (address is null) return NotFound(new { error = "Address not found." });

        address.FullName = request.FullName.Trim();
        address.Phone = request.Phone.Trim();
        address.PinCode = request.PinCode.Trim();
        address.PostalCode = request.PinCode.Trim();
        address.AddressLine = request.AddressLine.Trim();
        address.AddressLine1 = request.AddressLine.Trim();
        address.City = request.City.Trim();
        address.State = request.State.Trim();
        await db.SaveChangesAsync();

        return Ok(ResponseMapper.ToAddressDto(address));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery(Name = "user_id")] int userId)
    {
        var address = await db.Addresses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId && !x.IsDeleted);
        if (address is null) return NotFound(new { error = "Address not found." });

        address.IsDeleted = true;
        address.IsDefault = false;
        await db.SaveChangesAsync();
        return Ok(new { success = true });
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



