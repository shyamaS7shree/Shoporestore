import { Product } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Leather Briefcase',
    description: 'Handcrafted Italian leather briefcase with elegant design and spacious compartments.',
    price: 299.99,
    originalPrice: 399.99,
    category: 'Bags',
    image: '/products/briefcase.jpg',
    rating: 4.8,
    reviews: 127,
    inStock: true,
    images: ['/products/briefcase.jpg', '/products/briefcase-2.jpg', '/products/briefcase-3.jpg']
  },
  {
    id: '2',
    name: 'Minimalist Watch',
    description: 'Swiss-inspired timepiece with sapphire crystal and leather strap.',
    price: 189.99,
    category: 'Accessories',
    image: '/products/watch.jpg',
    rating: 4.9,
    reviews: 234,
    inStock: true,
    images: ['/products/watch.jpg', '/products/watch-2.jpg']
  },
  {
    id: '3',
    name: 'Cashmere Blend Scarf',
    description: 'Luxurious cashmere and silk blend scarf in neutral tones.',
    price: 129.99,
    originalPrice: 169.99,
    category: 'Accessories',
    image: '/products/scarf.jpg',
    rating: 4.7,
    reviews: 89,
    inStock: true,
    images: ['/products/scarf.jpg']
  },
  {
    id: '4',
    name: 'Premium Sunglasses',
    description: 'UV protection with polarized lenses and titanium frame.',
    price: 219.99,
    category: 'Eyewear',
    image: '/products/sunglasses.jpg',
    rating: 4.6,
    reviews: 156,
    inStock: true,
    images: ['/products/sunglasses.jpg', '/products/sunglasses-2.jpg']
  },
  {
    id: '5',
    name: 'Wool Overcoat',
    description: 'Premium wool blend coat with timeless silhouette and meticulous tailoring.',
    price: 449.99,
    originalPrice: 599.99,
    category: 'Clothing',
    image: '/products/overcoat.jpg',
    rating: 4.9,
    reviews: 98,
    inStock: true,
    images: ['/products/overcoat.jpg', '/products/overcoat-2.jpg']
  },
  {
    id: '6',
    name: 'Leather Wallet',
    description: 'Italian leather wallet with RFID protection and multiple card slots.',
    price: 79.99,
    category: 'Accessories',
    image: '/products/wallet.jpg',
    rating: 4.8,
    reviews: 312,
    inStock: true,
    images: ['/products/wallet.jpg']
  },
  {
    id: '7',
    name: 'Canvas Backpack',
    description: 'Durable canvas and leather backpack perfect for travel and daily use.',
    price: 159.99,
    originalPrice: 199.99,
    category: 'Bags',
    image: '/products/backpack.jpg',
    rating: 4.7,
    reviews: 201,
    inStock: true,
    images: ['/products/backpack.jpg', '/products/backpack-2.jpg']
  },
  {
    id: '8',
    name: 'Silk Pocket Square',
    description: 'Luxurious silk pocket square in various patterns.',
    price: 49.99,
    category: 'Accessories',
    image: '/products/pocket-square.jpg',
    rating: 4.5,
    reviews: 67,
    inStock: true,
    images: ['/products/pocket-square.jpg']
  },
];

export const categories = ['All', 'Clothing', 'Accessories', 'Bags', 'Eyewear'];

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'All') return products;
  return products.filter(p => p.category === category);
}
