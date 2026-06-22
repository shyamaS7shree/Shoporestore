const budgetPrices = [199, 249, 299, 349, 399, 449, 499, 599, 699, 799, 999, 1299];
const standardPrices = [299, 399, 499, 599, 799, 999, 1199, 1499, 1799, 2199];
const premiumPrices = [499, 799, 999, 1299, 1599, 1999, 2499, 2999, 3999, 4999];

function priceBandForSlug(slug: string) {
  const normalized = slug.toLowerCase();

  if (
    /beauty|makeup|lip|mask|skincare|hair|bath|body|deodorant|grooming|wallet|belt|cap|sunglass|frame|jewellery|toy|accessor/.test(
      normalized
    )
  ) {
    return budgetPrices;
  }

  if (/watch|handbag|bag|shoe|sneaker|footwear|appliance|dryer|sherwani|blazer|coat|jacket/.test(normalized)) {
    return premiumPrices;
  }

  return standardPrices;
}

export function getCatalogPrice(slug: string, index: number) {
  const prices = priceBandForSlug(slug);
  return prices[index % prices.length];
}

export function getCatalogOriginalPrice(price: number, index: number) {
  if (index % 2 !== 0) return undefined;

  const markup = [1.6, 1.75, 1.9, 2][index % 4];
  return Math.ceil((price * markup) / 10) * 10 - 1;
}

export function getCatalogDiscount(price: number, originalPrice?: number) {
  if (!originalPrice || originalPrice <= price) return undefined;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
