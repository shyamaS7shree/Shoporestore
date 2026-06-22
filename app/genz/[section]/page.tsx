'use client';

import ProductListingPage from '@/components/ProductListingPage';
import { buildCatalogConfig } from '@/lib/productCatalog';
import { useParams } from 'next/navigation';

const imageDir = '/genz section';

const commonFilters = [
  { label: 'Size', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Color', options: ['Black', 'White', 'Blue', 'Pink', 'Green', 'Brown'] },
  { label: 'Price', options: ['Under Rs. 300', 'Under Rs. 500', 'Under Rs. 1,000', 'Under Rs. 5,000'] },
  { label: 'Discount', options: ['70% and above', '60% and above', '50% and above', '40% and above'] },
];

const catalog = {
  dresses: { title: 'GenZ Dresses', description: 'Dress', brands: ['H&M', 'Zara', 'Urbanic', 'Style Union'], imageDir: '/Women section', files: ['dress1.avif', 'dress2.avif', 'dress3.avif', 'dress4.avif', 'dress5.avif'] },
  tops: { title: 'GenZ Tops', description: 'Top', brands: ['H&M', 'Zara', 'Urbanic', 'ONLY'], imageDir: '/Women section', files: ['top1.avif', 'top2.avif', 'top3.avif', 'top4.avif', 'top5.avif'] },
  'women-jeans': { title: 'GenZ Women Jeans', description: 'Jeans', brands: ['Levis', 'Zara', 'Flying Machine', 'ONLY'], imageDir: '/Women section', files: ['jeans1.avif', 'jeans2.avif', 'jeans3.avif', 'jeans4.avif', 'jeans5.avif'] },
  trousers: { title: 'GenZ Trousers', description: 'Trouser', brands: ['H&M', 'Zara', 'Urbanic', 'AND'], imageDir: '/Women section', files: ['Trousers & Capris1.avif', 'Trousers & Capris2.avif', 'Trousers & Capris3.avif', 'Trousers & Capris4.avif', 'Trousers & Capris5.avif'] },
  'women-t-shirts': { title: 'GenZ Women T-Shirts', description: 'T-Shirt', brands: ['H&M', 'Mango', 'Levis', 'U.S. Polo Assn.'], imageDir: '/Women section', files: ['t-shirt1.avif', 't-shirt2.avif', 't-shirt3.avif', 't-shirt4.avif', 't-shirt5.avif'] },
  bras: { title: 'GenZ Bras', description: 'Bra', brands: ['Clovia', 'Zivame', 'Amante', 'Jockey'], imageDir: '/Women section', files: ['bra1.avif', 'bra2.avif', 'bra3.avif', 'bra4.avif', 'bra5.avif'] },
  'night-suits': { title: 'GenZ Night Suits', description: 'Night Suit', brands: ['Clovia', 'Zivame', 'Jockey', 'PrettySecrets'], files: ['nightsuit1.avif', 'nightsuit2.avif', 'nightsuit3.avif', 'nightsuit4.avif', 'nightsuit5.avif'] },
  nightdresses: { title: 'GenZ Nightdresses', description: 'Nightdress', brands: ['Clovia', 'Zivame', 'Jockey', 'PrettySecrets'], files: ['nightdress1.avif', 'nightdress2.avif', 'nightdress3.avif', 'nightdress4.avif', 'nightdress5.avif'] },
  'men-t-shirts': { title: 'GenZ Men T-Shirts', description: 'T-Shirt', brands: ['BOSS', 'U.S. Polo Assn.', 'Van Heusen', 'FRATINI'], imageDir: '/men section', files: ['boss_green_embroidered_logo_cotton_pique_pallas_regular_fit_polo_t-shirt.avif', 'boss_blue_regular_fit_polo_t-shirt_with_logo_print.avif', 'boss_blue_cotton_silk_regular_fit_polo_t-shirt.avif', 'AUSK-Men-Cotton-Blend-Oversized-SDL585794666-1-64079.avif', 'TrendsTalk-Men-Cotton-Blend-Oversized-SDL392696376-1-d4a65.avif'] },
  shirts: { title: 'GenZ Shirts', description: 'Shirt', brands: ['Snitch', 'H&M', 'Campus Sutra', 'Wrogn'], imageDir: '/men section', files: ['shirtca1.avif', 'shirtca2.avif', 'shirtca3.avif', 'shirtca4.avif', 'shirtca5.avif'] },
  'men-jeans': { title: 'GenZ Men Jeans', description: 'Jeans', brands: ['Levis', 'Wrangler', 'Lee', 'Flying Machine'], imageDir: '/men section', files: ['jeans1.avif', 'jeans2.avif', 'jeans3.avif', 'jeans4.avif', 'jeans5.avif'] },
  kurtas: { title: 'GenZ Kurtas', description: 'Kurta', brands: ['Manyavar', 'Fabindia', 'Ethnix', 'Soch'], imageDir: '/men section', files: ['kurta_set1.avif', 'kurtaset2.avif', 'kurta_set3.avif', 'kurtaset4.avif', 'kurtaset5.avif', 'kurta_set6.avif'] },
  'kurta-sets': { title: 'GenZ Kurta Sets', description: 'Kurta Set', brands: ['Manyavar', 'Fabindia', 'Ethnix', 'Soch'], imageDir: '/men section', files: ['kurta_set1.avif', 'kurtaset2.avif', 'kurta_set3.avif', 'kurtaset4.avif', 'kurtaset5.avif', 'kurta_set6.avif'] },
  'women-footwear': { title: 'GenZ Women Footwear', description: 'Footwear', brands: ['Metro', 'Bata', 'Catwalk', 'Inc.5'], imageDir: '/Women section', files: ['Footwear1.avif', 'Footwear2.avif', 'Footwear3.avif', 'Footwear4.avif', 'Footwear5.avif'], sizes: ['3', '4', '5', '6', '7', '8'] },
  'men-casual-shoes': { title: 'GenZ Men Casual Shoes', description: 'Casual Shoes', brands: ['U.S. Polo Assn.', 'Louis Philippe', 'Van Heusen', 'Arrow'], imageDir: '/men section', files: ['casual1.avif', 'casual2.avif', 'casual3.avif', 'casual4.avif', 'casual5.avif'], sizes: ['6', '7', '8', '9', '10', '11'] },
  'men-sports-shoes': { title: 'GenZ Men Sports Shoes', description: 'Sports Shoes', brands: ['Nike', 'Adidas', 'Puma', 'HRX'], imageDir: '/men section', files: ['sneakers1.avif', 'sneakers3.avif', 'sneakers4.avif', 'sneakers5.avif'], sizes: ['6', '7', '8', '9', '10', '11'] },
  'men-formal-shoes': { title: 'GenZ Men Formal Shoes', description: 'Formal Shoes', brands: ['Louis Philippe', 'Van Heusen', 'Arrow', 'Raymond'], imageDir: '/men section', files: ['formal1.avif', 'formal2.avif', 'formal3.avif', 'formal4.avif', 'formal5.avif'], sizes: ['6', '7', '8', '9', '10', '11'] },
  jewellery: { title: 'GenZ Jewellery', description: 'Jewellery', brands: ['Accessorize', 'Rubans', 'Voylla', 'Zaveri Pearls'], imageDir: '/Women section', files: ['Fashion Jewellery1.avif', 'Fashion Jewellery2.avif', 'Fashion Jewellery3.avif', 'Fashion Jewellery4.avif', 'Fashion Jewellery5.avif'] },
  handbags: { title: 'GenZ Handbags', description: 'Handbag', brands: ['Lavie', 'Baggit', 'Caprese', 'Hidesign'], imageDir: '/Women section', files: ['handbag1.avif', 'handbag2.avif', 'handbag3.avif', 'handbag4.avif', 'handbag5.avif', 'handbag6.avif', 'handbag7.avif', 'handbag8.avif', 'handbag9.avif', 'handbag10.avif'] },
  clutches: { title: 'GenZ Clutches', description: 'Clutch', brands: ['Lavie', 'Baggit', 'Caprese', 'Aldo'], files: ['clutches1.avif', 'clutches2.avif', 'clutches3.avif', 'clutches4.avif', 'clutches5.avif'] },
  backpacks: { title: 'GenZ Backpacks', description: 'Backpack', brands: ['Lavie', 'Baggit', 'Caprese', 'Hidesign'], imageDir: '/Women section', files: ['handbag1.avif', 'handbag2.avif', 'handbag3.avif', 'handbag4.avif', 'handbag5.avif'] },
  wallets: { title: 'GenZ Wallets', description: 'Wallet', brands: ['Tommy Hilfiger', 'Hidesign', 'Fossil', 'Levis'], imageDir: '/men section', files: ['Wallets1.avif', 'Wallets2.avif', 'Wallets3.avif', 'Wallets4.avif', 'Wallets5.avif'] },
  sunglasses: { title: 'GenZ Sunglasses', description: 'Sunglasses', brands: ['Fastrack', 'Ray-Ban', 'IDEE', 'Vogue'], imageDir: '/Women section', files: ['Sunglasses & Frames1.avif', 'Sunglasses & Frames2.avif', 'Sunglasses & Frames3.avif', 'Sunglasses & Frames4.avif', 'Sunglasses & Frames5.avif'] },
  belts: { title: 'GenZ Belts', description: 'Belt', brands: ['Tommy Hilfiger', 'Hidesign', 'Fossil', 'Levis'], imageDir: '/men section', files: ['Belts1.avif', 'Belts2.avif', 'Belts3.avif', 'Belts4.avif', 'Belts5.avif'] },
  caps: { title: 'GenZ Caps', description: 'Cap', brands: ['H&M', 'Zara', 'Fastrack', 'U.S. Polo Assn.'], imageDir: '/Women section', files: ['Belts,Scarves1.avif', 'Belts,Scarves2.avif', 'Belts,Scarves3.avif', 'Belts,Scarves4.avif', 'Belts,Scarves5.avif'] },
  skincare: { title: 'GenZ Skincare', description: 'Skincare', brands: ['Lakme', 'LOreal', 'Mamaearth', 'Nivea'], imageDir: '/Women section', files: ['Skincare1.avif', 'Skincare2.avif', 'Skincare3.avif', 'Skincare4.avif', 'Skincare5.avif'] },
  haircare: { title: 'GenZ Haircare', description: 'Haircare', brands: ['Dove', 'TRESemme', 'Pantene', 'Head & Shoulders'], imageDir: '/dedorant/shampoo', files: ['233-2338209_transparent-shampoo-bottle-png-transparent-background-shampoo-bottles.png', '24-244597_tresemme-coconut-milk-and-aloe-vera-shampoo-hd.png', 'pexels-by-natallia-311038782-13573917.jpg', 'pexels-johndetochka-14267487.jpg.jpeg'] },
  'bath-body': { title: 'GenZ Bath & Body', description: 'Bath & Body', brands: ['Plum', 'Engage', 'Wottagirl', 'Bath & Body Works'], imageDir: '/body mist/body mist', files: ['-original-imahk4ayqra6kfuy.webp', '100-bodylovin-vanilla-vibes-long-lasting-vanilla-fragrance-original-imahmnbkqbj6qhnh.webp', '100-coconut-crumble-body-hair-mist-1-body-mist-spritz-by-typsy-original-imahhqwrxn7j6zjc.webp', '120-wottagirl-secret-chrush-amber-kiss-body-splash-long-lasting-original-imahgfydyekfz2zr.webp', '135-bold-long-lasting-body-mist-for-women-dermatologically-original-imahe5fru8sajp9x.webp'] },
  makeup: { title: 'GenZ Makeup', description: 'Makeup', brands: ['Lakme', 'Maybelline', 'Sugar', 'Colorbar'], imageDir: '/Women section', files: ['Makeup1.avif', 'Makeup2.avif', 'Makeup3.avif', 'Makeup4.avif', 'Makeup5.avif'] },
  fragrances: { title: 'GenZ Fragrances', description: 'Fragrance', brands: ['Fogg', 'Nivea', 'Axe', 'Engage'], imageDir: '/dedorant/dedorant', files: ['47768-6-deodorant-image-free-download-png-hd.png', 'axe-bodyspray-191361_1280.jpg', 'deodorant-519244_640.png', 'free-photo-of-cosmetic-product-in-black-canister.jpeg'] },
  appliances: { title: 'GenZ Appliances', description: 'Appliance', brands: ['Havells', 'Philips', 'Vega', 'Impex'], imageDir: '/dedorant/hairdryer', files: ['10154869HD-1300.webp', '61SBB6-s4vL._SL1500_-1200x1200.jpg', 'havells-hd-3104-hair-dryers-sky-blue-108173455-6o218.avif', 'hd-1835-hav-hd-1835-havells-original-imahj4bufsyysukh.webp'] },
};

const groups = {
  fashion: { title: 'GenZ Fashion', slugs: ['dresses', 'tops', 'women-jeans', 'trousers', 'women-t-shirts', 'men-t-shirts', 'shirts', 'men-jeans'] },
  "women's-western-wear": { title: "GenZ Women's Western Wear", slugs: ['dresses', 'tops', 'women-jeans', 'trousers', 'women-t-shirts'] },
  'lingerie-loungewear': { title: 'GenZ Lingerie & Loungewear', slugs: ['bras', 'night-suits', 'nightdresses'] },
  "men's-casual-wear": { title: "GenZ Men's Casual Wear", slugs: ['men-t-shirts', 'shirts', 'men-jeans'] },
  "men's-occassion-wear": { title: "GenZ Men's Occassion Wear", slugs: ['kurtas', 'kurta-sets'] },
  "women's-footwear": { title: "GenZ Women's Footwear", slugs: ['women-footwear'] },
  "men's-footwear": { title: "GenZ Men's Footwear", slugs: ['men-casual-shoes', 'men-sports-shoes', 'men-formal-shoes'] },
  'beauty-grooming': { title: 'GenZ Beauty & Grooming', slugs: ['skincare', 'haircare', 'bath-body', 'makeup', 'fragrances', 'appliances'] },
  accessories: { title: 'GenZ Accessories', slugs: ['jewellery', 'handbags', 'clutches', 'backpacks', 'wallets', 'sunglasses', 'belts', 'caps'] },
};

const aliases = {
  'dresses-under-rs-599': 'dresses',
  'tops-under-rs-399': 'tops',
  'jeans-under-rs-599': 'women-jeans',
  'trousers-under-rs-699': 'trousers',
  't-shirts-under-rs-299': 'women-t-shirts',
  'bras-under-rs-399': 'bras',
  'night-suits-under-rs-799': 'night-suits',
  'nightdresses-under-rs-999': 'nightdresses',
  'men-t-shirts-under-rs-299': 'men-t-shirts',
  'shirts-under-rs-499': 'shirts',
  'men-jeans-under-rs-599': 'men-jeans',
  'kurtas-under-rs-799': 'kurtas',
  'kurta-sets-under-rs-999': 'kurta-sets',
  'heels-under-rs-599': 'women-footwear',
  'flats-under-rs-499': 'women-footwear',
  'casual-shoes-under-rs-699': 'women-footwear',
  'sports-shoes-under-rs-999': 'men-sports-shoes',
  'flip-flops-under-rs-799': 'women-footwear',
  'boots-under-rs-999': 'women-footwear',
  'ballerinas-under-rs-799': 'women-footwear',
  'casual-shoes-under-rs-799': 'men-casual-shoes',
  'men-casual-shoes-under-rs-799': 'men-casual-shoes',
  'men-sports-shoes-under-rs-999': 'men-sports-shoes',
  'men-formal-shoes-under-rs-999': 'men-formal-shoes',
  'men-casual-shoes': 'men-casual-shoes',
  'formal-shoes-under-rs-999': 'men-formal-shoes',
  'sandals-under-rs-799': 'men-casual-shoes',
  'flip-flops-under-rs-499': 'men-casual-shoes',
  'skincare-under-rs-299': 'skincare',
  'haircare-under-rs-399': 'haircare',
  'bath-body-under-rs-399': 'bath-body',
  'makeup-under-rs-299': 'makeup',
  'fragrances-under-rs-399': 'fragrances',
  'appliances-under-rs-999': 'appliances',
  'jewellery-under-rs-299': 'jewellery',
  'handbags-under-rs-499': 'handbags',
  'clutches-under-rs-999': 'clutches',
  'backpacks-under-rs-699': 'backpacks',
  'wallets-under-rs-499': 'wallets',
  'sunglasses-under-rs-699': 'sunglasses',
  'belts-under-rs-799': 'belts',
  'caps-under-rs-899': 'caps',
};

export default function GenzSectionPage() {
  const params = useParams();
  const section = params.section as string;

  return (
    <ProductListingPage
      config={buildCatalogConfig({
        section,
        accentColor: '#14b8a6',
        defaultSlug: 'dresses',
        fallbackTitle: 'GenZ Fashion',
        imageDir,
        catalog,
        groups,
        aliases,
        commonFilters,
        stripPrefix: /^GenZ\s/,
      })}
    />
  );
}
