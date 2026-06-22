'use client';
import ProductListingPage, { CategoryConfig } from '@/components/ProductListingPage';

const BEAUTY_CONFIG: CategoryConfig = {
  title: 'Beauty & Personal Care',
  totalProducts: 9241,
  accentColor: '#14b8a6',
  brands: ['Lakme', 'Maybelline', "L'Oreal", 'Mamaearth', 'MCaffeine', 'Nivea'],
  filters: [
    { label: 'Categories', options: ['Makeup', 'Skincare', 'Haircare', 'Fragrances', 'Appliances', 'Bath & Body', "Men's Grooming"] },
    { label: 'Sub-Categories', options: ['Lipstick', 'Foundation', 'Mascara', 'Eyeliner', 'Kajal', 'Face Wash', 'Moisturiser', 'Sunscreen'] },
    { label: 'Brands', options: ['Lakme', 'Maybelline', "L'Oreal", 'Mamaearth', 'MCaffeine', 'Nivea', 'Biotique', 'THE BODY SHOP', 'Bath & Body Works', 'Lotus Herbals'] },
    { label: 'Skin Type', options: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'] },
    { label: 'Price', options: ['Under Rs. 300', 'Under Rs. 500', 'Under Rs. 1,000', 'Under Rs. 5,000'] },
    { label: 'Offers', options: ['Select All', 'Flat 20% Off', 'Flat 30% Off', 'Flat 40% Off'] },
    { label: 'Discount', options: ['60%', '50%', '40%', '30%', '20%'] },
    { label: 'Concern', options: ['Anti-Aging', 'Acne', 'Dark Spots', 'Hydration', 'Brightening', 'Sun Protection'] },
  ],
  products: Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    brand: ['Lakme', 'Maybelline', "L'Oreal", 'Mamaearth', 'MCaffeine', 'Nivea', 'Biotique', 'THE BODY SHOP'][i % 8],
    description: ['Absolute Matte Lipstick', 'Fit Me Foundation', 'Revitalift Serum', 'Vitamin C Face Wash', 'Coffee Face Scrub', 'Moisturising Cream', 'Sunscreen SPF 50', 'Body Butter'][i % 8],
    price: [199, 249, 299, 349, 399, 449, 499, 799][i % 8],
    originalPrice: i % 3 === 0 ? ([399, 499, 599, 699, 799, 899, 999, 1299][i % 8]) : undefined,
    discount: i % 3 === 0 ? ([50, 50, 50, 50, 50, 50, 50, 38][i % 8]) : undefined,
    offer: i % 5 === 0 ? '1 Offer Available' : undefined,
  })),
};

export default function BeautyPage() {
  return <ProductListingPage config={BEAUTY_CONFIG} />;
}
