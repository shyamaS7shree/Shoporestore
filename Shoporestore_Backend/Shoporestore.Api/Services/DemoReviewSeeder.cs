using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;
using Shoporestore.Api.Models;

namespace Shoporestore.Api.Services;

public static class DemoReviewSeeder
{
    private static readonly (string Name, string Email, string Phone)[] DemoUsers =
    [
        ("Ananya Sen", "demo.shopper@shopore.local", "DEMO-REVIEW-001"),
        ("Rahul Mehta", "sample.customer@shopore.local", "DEMO-REVIEW-002"),
        ("Priya Sharma", "shopore.preview@shopore.local", "DEMO-REVIEW-003")
    ];

    public static async Task SeedAsync(ShoporeDbContext db)
    {
        var emails = DemoUsers.Select(x => x.Email).ToList();
        var users = await db.Users.Where(x => emails.Contains(x.Email)).ToListAsync();
        foreach (var demo in DemoUsers)
        {
            var user = users.FirstOrDefault(user => user.Email == demo.Email);
            if (user is null)
            {
                user = new User
                {
                    Email = demo.Email,
                    PasswordHash = "DEMO_ACCOUNT_DISABLED"
                };
                db.Users.Add(user);
                users.Add(user);
            }
            user.FullName = demo.Name;
            user.Phone = demo.Phone;
            user.IsActive = false;
        }
        await db.SaveChangesAsync();

        var reviewedProductIds = await db.Reviews.Select(x => x.ProductId).Distinct().ToListAsync();
        var products = await db.Products.Where(x => x.IsActive && !reviewedProductIds.Contains(x.Id)).ToListAsync();

        foreach (var product in products)
        {
            var samples = DemoReviewCatalog.GetReviews(product.Id);
            foreach (var sample in samples.Select((review, index) => new { review, index }))
            {
                db.Reviews.Add(new Review
                {
                    UserId = users[sample.index % users.Count].Id,
                    ProductId = product.Id,
                    Rating = sample.review.Rating,
                    Title = sample.review.Title,
                    Comment = sample.review.Comment,
                    ImageDataUrl = product.Image,
                    IsApproved = true,
                    IsDemo = true,
                    CreatedAt = sample.review.CreatedAt
                });
            }

            product.ReviewsCount = samples.Count;
            product.Rating = samples.Count == 0 ? 0 : Math.Round((decimal)samples.Average(x => x.Rating), 2);
        }

        await db.SaveChangesAsync();
    }
}
