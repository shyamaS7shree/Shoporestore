export type ProductSizingInfo = {
  name?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  department?: string;
  image?: string;
  sizeOptions?: string[];
};

const ADULT_CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const KIDS_CLOTHING_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'];
const MEN_FOOTWEAR_SIZES = ['6', '7', '8', '9', '10', '11'];
const WOMEN_FOOTWEAR_SIZES = ['3', '4', '5', '6', '7', '8'];
const KIDS_FOOTWEAR_SIZES = ['1C', '2C', '3C', '4C', '5C', '1Y', '2Y'];
const BRA_SIZES = ['32B', '34B', '36B', '38B', '34C', '36C'];

export function getProductSizeOptions(product: ProductSizingInfo): string[] {
  if (Array.isArray(product.sizeOptions)) return product.sizeOptions;
  const text = [
    product.name,
    product.description,
    product.category,
    product.subCategory,
    product.department,
    product.image,
  ].join(' ').toLowerCase();

  const isKids = /\bkid|\bboy|\bgirl|kids%20section|kids section/.test(text);
  const isWomen = /\bwomen|women%20section|women section|\bladies|\bfemale/.test(text);
  const isFootwear = /shoe|sneaker|footwear|sandal|flip\s*-?\s*flop|flipflop|boot|flat|heel|ballerina|slipper/.test(text);

  if (isFootwear) {
    if (isKids) return KIDS_FOOTWEAR_SIZES;
    if (isWomen) return WOMEN_FOOTWEAR_SIZES;
    return MEN_FOOTWEAR_SIZES;
  }

  if (/\bbra\b/.test(text)) return BRA_SIZES;
  if (/saree|dupatta|scarf|shawl/.test(text)) return [];

  const isClothing = /shirt|t-shirt|tshirt|top|dress|jeans|trouser|short|jogger|pant|kurta|suit|legging|skirt|palazzo|jacket|blazer|coat|shapewear|sleepwear|loungewear|bodysuit|romper|brief|trunk|boxer|vest|thermal|sweater|sweatshirt/.test(text);
  if (!isClothing) return [];

  return isKids ? KIDS_CLOTHING_SIZES : ADULT_CLOTHING_SIZES;
}
