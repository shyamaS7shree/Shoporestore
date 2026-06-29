using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;

namespace Shoporestore.Api.Services;

public static class OrderNumberService
{
    public static string Generate()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
        var suffix = RandomNumberGenerator.GetInt32(0, 100000).ToString("D5");
        return $"{timestamp}{suffix}";
    }

    public static async Task NormalizeExistingAsync(ShoporeDbContext db)
    {
        var orders = await db.Orders.ToListAsync();
        var used = orders
            .Select(x => x.OrderNumber)
            .Where(IsValid)
            .ToHashSet(StringComparer.Ordinal);
        var changed = false;

        foreach (var order in orders.Where(order => !IsValid(order.OrderNumber)))
        {
            string number;
            do number = Generate(); while (!used.Add(number));
            order.OrderNumber = number;
            changed = true;
        }

        if (changed) await db.SaveChangesAsync();
    }

    private static bool IsValid(string? value) =>
        value?.Length == 18 && value.All(char.IsDigit);
}
