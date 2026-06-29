namespace Shoporestore.Api.Services;

public record DemoReviewItem(
    string Id,
    string UserName,
    int Rating,
    string Title,
    string Comment,
    DateTime CreatedAt);

public static class DemoReviewCatalog
{
    private static readonly string[] Names = ["Demo shopper", "Sample customer", "Shopore preview"];
    private static readonly string[] Titles = ["Good quality", "Looks great", "Worth the price", "Nice product"];
    private static readonly string[] Comments =
    [
        "The product looks good and the quality feels right for the price.",
        "The design and finish are nice. It matched the product photos well.",
        "A comfortable and useful choice with a clean overall look.",
        "Good value and presentation. The product details were accurate."
    ];

    public static IReadOnlyList<DemoReviewItem> GetReviews(int productId)
    {
        // Keep a small portion of the catalog empty so the real no-review state is still testable.
        if (productId <= 0 || productId % 6 == 0) return [];

        var count = 2 + productId % 3;
        return Enumerable.Range(0, count)
            .Select(index => new DemoReviewItem(
                $"demo-{productId}-{index + 1}",
                Names[(productId + index) % Names.Length],
                index == count - 1 || (productId + index * 2) % 5 == 0 ? 4 : 5,
                Titles[(productId + index) % Titles.Length],
                Comments[(productId * 2 + index) % Comments.Length],
                DateTime.UtcNow.Date.AddDays(-((productId + 1) * (index + 2) % 75))))
            .ToList();
    }

    public static decimal GetRating(int productId)
    {
        var reviews = GetReviews(productId);
        return reviews.Count == 0 ? 0 : Math.Round((decimal)reviews.Average(x => x.Rating), 1);
    }

    public static int GetReviewCount(int productId) => GetReviews(productId).Count;
}
