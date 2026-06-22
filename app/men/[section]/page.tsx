'use client';

import ProductListingPage, { CategoryConfig, Product } from '@/components/ProductListingPage';
import { getCatalogDiscount, getCatalogOriginalPrice, getCatalogPrice } from '@/lib/pricing';
import { useParams } from 'next/navigation';

const MEN_IMAGE_DIR = '/men%20section';

const imagePath = (fileName: string) => `${MEN_IMAGE_DIR}/${encodeURIComponent(fileName)}`;

const commonFilters = [
  { label: 'Color', options: ['Black', 'Blue', 'White', 'Grey', 'Green'] },
  { label: 'Fit', options: ['Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Oversized'] },
  { label: 'Price', options: ['Under Rs. 300', 'Under Rs. 500', 'Under Rs. 1,000', 'Under Rs. 5,000'] },
  { label: 'Discount', options: ['70% and above', '60% and above', '50% and above', '40% and above'] },
];

const catalog: Record<string, { title: string; description: string; brands: string[]; files: string[] }> = {
  't-shirts': {
    title: 'Men T-Shirts',
    description: 'Cotton T-Shirt',
    brands: ['BOSS', 'U.S. Polo Assn.', 'Van Heusen', 'FRATINI'],
    files: [
      'boss_green_embroidered_logo_cotton_pique_pallas_regular_fit_polo_t-shirt.avif',
      'boss_blue_regular_fit_polo_t-shirt_with_logo_print.avif',
      'boss_blue_cotton_silk_regular_fit_polo_t-shirt.avif',
      'emporio_armani_black_blended_regular_fit_polo_t-shirt.avif',
      'AUSK-Men-Cotton-Blend-Oversized-SDL585794666-1-64079.avif',
      'TrendsTalk-Men-Cotton-Blend-Oversized-SDL392696376-1-d4a65.avif',
    ],
  },
  'casual-shirts': {
    title: 'Men Casual Shirts',
    description: 'Casual Shirt',
    brands: ['U.S. Polo Assn.', 'Louis Philippe', 'Van Heusen', 'Arrow'],
    files: ['shirtca1.avif', 'shirtca2.avif', 'shirtca3.avif', 'shirtca4.avif', 'shirtca5.avif'],
  },
  'formal-shirts': {
    title: 'Men Formal Shirts',
    description: 'Formal Shirt',
    brands: ['Louis Philippe', 'Van Heusen', 'Arrow', 'Raymond'],
    files: ['shirtfor1.avif', 'shirtfor2.avif', 'shirtfor3.avif', 'shirtfor4.avif'],
  },
  jackets: {
    title: 'Men Jackets',
    description: 'Jacket',
    brands: ['BOSS', 'Diesel', 'All Saints', 'Emporio Armani'],
    files: [
      'all_saints_brown_nates_jacket.avif',
      'boss_blue_seasonal_print_zip-up_hooded_jacket.avif',
      'boss_black_lunar_new_year_x_boss_cotton_denim_jacket.avif',
      'diesel_olive_green_puffer_jacket_with_monogram_motif.avif',
      'emporio_armani_black_regular_fit_polyamide_jacket.avif',
      'coach_blue_tom_wesselmann_workers_slim_fit_jacket.avif',
    ],
  },
  'blazers-coats': {
    title: 'Men Blazers & Coats',
    description: 'Blazer & Coat',
    brands: ['Louis Philippe', 'Van Heusen', 'Arrow', 'Raymond'],
    files: ['coat1.avif', 'coat2.avif', 'coat3.avif', 'coat4.avif', 'coat5.avif', 'coat6.avif', 'coat7.avif', 'coat8.avif', 'coat9.avif', 'coat10.avif'],
  },
  jeans: {
    title: 'Men Jeans',
    description: 'Slim Fit Jeans',
    brands: ['Levis', 'Wrangler', 'Lee', 'Flying Machine'],
    files: ['jeans1.avif', 'jeans2.avif', 'jeans3.avif', 'jeans4.avif', 'jeans5.avif'],
  },
  'formal-trousers': {
    title: 'Men Formal Trousers',
    description: 'Formal Trouser',
    brands: ['Louis Philippe', 'Van Heusen', 'Arrow', 'Raymond'],
    files: ['trousers1.avif', 'trousers2.avif', 'trousers3.avif', 'trouser4.avif', 'trousers5.avif'],
  },
  shorts: {
    title: 'Men Shorts',
    description: 'Casual Shorts',
    brands: ['Nike', 'Adidas', 'Puma', 'HRX'],
    files: ['shorts1.avif', 'shorts2.avif', 'shots3.avif', 'shorts4.avif', 'shorts5.avif', 'shorts6.avif', 'shorts7.avif', 'shorts8.avif', 'shorts9.avif', 'shorts10.avif'],
  },
  'track-pants-joggers': {
    title: 'Men Track Pants & Joggers',
    description: 'Track Pants & Joggers',
    brands: ['Nike', 'Adidas', 'Puma', 'HRX'],
    files: ['trackpant1.avif', 'trackpant2.avif', 'trackpant3.avif', 'trackpant4regular_fit_track_pants.avif', 'trackpant5relaxed_fit_sweatpants.avif', 'tracpant6.avif', 'track_pants7.avif', 'track_pants8.avif', 'Trackpant9.avif', 'Trackpant10.avif'],
  },
  'kurtas-kurta-sets': {
    title: 'Men Kurtas & Kurta Sets',
    description: 'Kurta Set',
    brands: ['Manyavar', 'Fabindia', 'Ethnix', 'Soch'],
    files: ['kurta_set1.avif', 'kurtaset2.avif', 'kurta_set3.avif', 'kurtaset4.avif', 'kurtaset5.avif', 'kurta_set6.avif'],
  },
  sherwanis: {
    title: 'Men Sherwanis',
    description: 'Sherwani',
    brands: ['Manyavar', 'Ethnix', 'Soch', 'Kisah'],
    files: ['sherwani_churidar_set1.avif', 'sherwani2.avif', 'sherwani_kurta3.avif', 'sherwani_set4.avif', 'sherwani5.avif'],
  },
  'nehru-jackets': {
    title: 'Men Nehru Jackets',
    description: 'Nehru Jacket',
    brands: ['Manyavar', 'Ethnix', 'Fabindia', 'Kisah'],
    files: ['nehru_jacket1.avif', 'neheru_jacket2.avif', 'neheru jacket3.avif', 'nehru_jacket4.avif', 'neheru_jacket5.avif'],
  },
  'briefs-trunks': {
    title: 'Men Briefs & Trunks',
    description: 'Briefs & Trunks',
    brands: ['Jockey', 'Calvin Klein', 'Van Heusen', 'XYXX'],
    files: ['Briefs & Trunks1.avif', 'Briefs & Trunks2.avif', 'Briefs & Trunks3.avif', 'Briefs & Trunks4.avif', 'Briefs & Trunks5.avif'],
  },
  boxers: {
    title: 'Men Boxers',
    description: 'Boxers',
    brands: ['Jockey', 'Calvin Klein', 'Van Heusen', 'XYXX'],
    files: ['boxers1.avif', 'boxers2.avif', 'boxers3.avif', 'boxer4.avif', 'boxers5.avif'],
  },
  vests: {
    title: 'Men Vests',
    description: 'Vest',
    brands: ['Jockey', 'Calvin Klein', 'Van Heusen', 'XYXX'],
    files: ['vest1.avif', 'vest2.avif', 'vests3.avif', 'vest4.avif', 'vest5.avif'],
  },
  thermals: {
    title: 'Men Thermals',
    description: 'Thermal',
    brands: ['Jockey', 'Van Heusen', 'Lux', 'XYXX'],
    files: ['thermal1.avif', 'thermal2.avif', 'thermal3.avif', 'thermal4.avif', 'thermal5.avif'],
  },
  sneakers: {
    title: 'Men Sneakers',
    description: 'Sneakers',
    brands: ['Nike', 'Adidas', 'Puma', 'Bata'],
    files: ['sneakers1.avif', 'sneakers3.avif', 'sneakers4.avif', 'sneakers5.avif'],
  },
  
  'formal-shoes': {
    title: 'Men Formal Shoes',
    description: 'Formal Shoe',
    brands: ['Louis Philippe', 'Van Heusen', 'Arrow', 'Raymond'],
    files: ['formal1.avif', 'formal2.avif', 'formal3.avif', 'formal4.avif', 'formal5.avif'],
  },
    'casual-shoes': {
    title: 'Men Casual Shoes',
    description: 'Casual Shoe',
    brands: ['U.S. Polo Assn.', 'Louis Philippe', 'Van Heusen', 'Arrow'],
    files: ['casual1.avif', 'casual2.avif', 'casual3.avif', 'casual4.avif', 'casual5.avif'],
  },
  socks: {
    title: 'Men Socks',
    description: 'Socks',
    brands: ['Nike', 'Adidas', 'Puma', 'Jockey'],
    files: ['socks1.avif', 'socks2.avif', 'socks3.avif', 'socks4.avif', 'socks5.avif'],
  },
  swimwear: {
    title: 'Men Swimwear',
    description: 'Swimwear',
    brands: ['Speedo', 'Nike', 'Adidas', 'Puma'],
    files: ['swim1.avif', 'swim2.avif', 'swimwear3.avif', 'swimsuit4.avif', 'swimwear5.avif'],
  },
  wallets: {
    title: 'Men Wallets',
    description: 'Wallet',
    brands: ['Tommy Hilfiger', 'Hidesign', 'Fossil', 'Levis'],
    files: ['Wallets1.avif', 'Wallets2.avif', 'Wallets3.avif', 'Wallets4.avif', 'Wallets5.avif'],
  },
  belts: {
    title: 'Men Belts',
    description: 'Belt',
    brands: ['Tommy Hilfiger', 'Hidesign', 'Fossil', 'Levis'],
    files: ['Belts1.avif', 'Belts2.avif', 'Belts3.avif', 'Belts4.avif', 'Belts5.avif'],
  },
  'perfumes-body-mists': {
    title: 'Men Perfumes & Body Mists',
    description: 'Perfume & Body Mist',
    brands: ['Calvin Klein', 'BOSS', 'Park Avenue', 'Wild Stone'],
    files: ['perfume1.avif', 'perfume2.avif', 'perfume3.avif', 'perfume4.avif', 'setting mist.avif'],
  },
  'sunglasses-frames': {
    title: 'Men Sunglasses & Frames',
    description: 'Sunglasses & Frames',
    brands: ['Ray-Ban', 'Fastrack', 'Oakley', 'Polaroid'],
    files: ['sunglasses1.avif', 'sunglasses2.avif', 'sunglasse3.avif', 'sunglasses4.avif', 'sunglasses5.avif', 'sunglasses6.avif', 'sunglasses7.avif', 'sunglasses8.avif', 'sunglasses9.avif', 'sunglasses10.avif'],
  },
  watches: {
    title: 'Men Watches',
    description: 'Watch',
    brands: ['Fossil', 'Titan', 'Casio', 'Timex'],
    files: ['watches.avif', 'watches1.avif', 'watch2.avif', 'watch3.avif', 'watch4.avif', 'watch5.avif', 'watch6.avif', 'wtach7.avif', 'watch8.avif', 'watch9.avif'],
  },
  'plus-size': {
    title: 'Men Plus Size',
    description: 'Plus Size Clothing',
    brands: ['Instafab Plus', 'John Pride', 'Urbano Plus', 'Dennis Lingo'],
    files: ['PlusSize1.avif', 'PlusSize2.avif', 'PlusSize3.avif', 'PlusSize4.avif', 'PlusSize5.avif', 'PlusSize6.avif', 'PlusSize7.avif', 'PlusSize8.avif', 'PlusSize9.avif', 'PlusSize10.avif'],
  },
  'personal-care-grooming': {
    title: 'Men Personal Care & Grooming',
    description: 'Personal Care & Grooming',
    brands: ['Beardo', 'Bombay Shaving Company', 'Nivea', 'Park Avenue'],
    files: ['Personal Care & Grooming1.avif', 'Personal Care & Grooming2.avif', 'Personal Care & Grooming3.avif', 'Personal Care & Grooming4.avif', 'Personal Care & Grooming5.avif', 'Personal Care & Grooming6.avif', 'Personal Care & Grooming7.avif', 'Personal Care & Grooming8.avif', 'Personal Care & Grooming9.avif', 'Personal Care & Grooming10.avif'],
  },
};

const categoryGroups: Record<string, { title: string; slugs: string[] }> = {
  topwear: { title: 'Men Topwear', slugs: ['t-shirts', 'casual-shirts', 'formal-shirts', 'jackets', 'blazers-coats'] },
  bottomwear: { title: 'Men Bottomwear', slugs: ['jeans', 'formal-trousers', 'shorts', 'track-pants-joggers'] },
  footwear: { title: 'Men Footwear', slugs: ['casual-shoes', 'formal-shoes', 'sneakers', 'socks'] },
  'indian-festive-wear': { title: 'Men Indian & Festive Wear', slugs: ['kurtas-kurta-sets', 'sherwanis', 'nehru-jackets'] },
  'innerwear-sleepwear': { title: 'Men Innerwear & Sleepwear', slugs: ['briefs-trunks', 'boxers', 'vests', 'thermals'] },
  'sports-active-wear': { title: 'Men Sports & Active Wear', slugs: ['track-pants-joggers', 'swimwear'] },
  'fashion-accessories': { title: 'Men Fashion Accessories', slugs: ['wallets', 'belts', 'perfumes-body-mists'] },
};

const aliases: Record<string, string> = {
  kurtas: 'kurtas-kurta-sets',
  'sports-shoes': 'sneakers',
  sweatshirts: 't-shirts',
  suits: 'blazers-coats',
  'active-t-shirts': 't-shirts',
  'sports-accessories': 'fashion-accessories',
};

const productNamesBySlug: Record<string, string[]> = {
  't-shirts': ['Regular Fit Polo T-Shirt', 'Printed Cotton T-Shirt', 'Cotton Pique T-Shirt', 'Logo Crew Neck T-Shirt'],
  'casual-shirts': ['Checked Casual Shirt', 'Printed Casual Shirt', 'Regular Fit Casual Shirt', 'Cotton Casual Shirt'],
  'formal-shirts': ['Slim Fit Formal Shirt', 'Cotton Formal Shirt', 'Office Wear Shirt', 'Textured Formal Shirt'],
  jackets: ['Zip-Up Hooded Jacket', 'Denim Jacket', 'Puffer Jacket', 'Polyamide Jacket'],
  'blazers-coats': ['Single Breasted Blazer', 'Textured Formal Coat', 'Slim Fit Suit Coat', 'Wool Blend Overcoat'],
  jeans: ['Slim Fit Stretch Jeans', 'Straight Fit Denim Jeans', 'Tapered Blue Jeans', 'Washed Casual Jeans'],
  'formal-trousers': ['Slim Fit Formal Trouser', 'Flat Front Office Trouser', 'Tapered Formal Pants', 'Regular Fit Dress Trouser'],
  shorts: ['Cotton Casual Shorts', 'Drawstring Training Shorts', 'Printed Summer Shorts', 'Regular Fit Shorts'],
  'track-pants-joggers': ['Slim Fit Track Pants', 'Relaxed Fit Joggers', 'Training Track Pants', 'Cotton Blend Sweatpants'],
  'kurtas-kurta-sets': ['Cotton Kurta Set', 'Embroidered Kurta Set', 'Festive Kurta Pajama Set', 'Printed Ethnic Kurta'],
  sherwanis: ['Embroidered Sherwani Set', 'Jacquard Sherwani', 'Wedding Sherwani', 'Sherwani With Churidar'],
  'nehru-jackets': ['Textured Nehru Jacket', 'Festive Waistcoat', 'Printed Nehru Jacket', 'Ethnic Bandhgala Jacket'],
  'briefs-trunks': ['Cotton Briefs Pack', 'Trunks Pack', 'Stretch Cotton Briefs', 'Everyday Innerwear Trunks'],
  boxers: ['Printed Cotton Boxers', 'Relaxed Fit Boxers', 'Woven Boxer Shorts', 'Everyday Boxers Pack'],
  vests: ['Cotton Vest Pack', 'Sleeveless Innerwear Vest', 'Ribbed Cotton Vest', 'Classic White Vest'],
  thermals: ['Thermal Top', 'Winter Thermal Set', 'Full Sleeve Thermal Wear', 'Insulated Thermal Innerwear'],
  'casual-shoes': ['Lace-Up Casual Shoes', 'Everyday Walking Shoes', 'Slip-On Casual Shoes', 'Textured Casual Sneakers'],
  'formal-shoes': ['Leather Formal Shoes', 'Oxford Formal Shoes', 'Derby Dress Shoes', 'Polished Office Shoes'],
  sneakers: ['Low-Top Sneakers', 'Running Sneakers', 'Chunky Sole Sneakers', 'Lace-Up Sports Sneakers'],
  socks: ['Ankle Socks Pack', 'Cotton Crew Socks', 'No-Show Socks Pack', 'Sports Socks'],
  swimwear: ['Printed Swim Shorts', 'Quick Dry Swimwear', 'Poolside Swim Trunks', 'Active Swim Shorts'],
  wallets: ['Leather Bi-Fold Wallet', 'Textured Card Wallet', 'RFID Wallet', 'Classic Leather Wallet'],
  belts: ['Leather Formal Belt', 'Textured Casual Belt', 'Reversible Belt', 'Classic Buckle Belt'],
  'perfumes-body-mists': ['Fresh Eau De Parfum', 'Woody Body Mist', 'Long Lasting Perfume', 'Daily Grooming Fragrance'],
  'sunglasses-frames': ['Aviator Sunglasses', 'Square Sunglasses', 'UV Protected Frames', 'Wayfarer Sunglasses'],
  watches: ['Classic Analog Watch', 'Chronograph Watch', 'Leather Strap Watch', 'Stainless Steel Watch'],
  'plus-size': ['Plus Size Cotton Shirt', 'Plus Size Casual T-Shirt', 'Plus Size Track Pants', 'Plus Size Denim Jeans'],
  'personal-care-grooming': ['Beard Grooming Kit', 'Face Care Set', 'Shaving Essentials Kit', 'Daily Grooming Combo'],
};

const productDetailsByFile: Record<string, { brand: string; name: string }> = {
  'Belts2.avif': { brand: 'Armani Exchange', name: 'Logo Buckle Belt' },
  'Belts5.avif': { brand: 'Van Heusen', name: 'Leather Formal Belt' },
  'Briefs & Trunks3.avif': { brand: 'Tommy Hilfiger', name: 'Cotton Briefs Pack' },
  'Briefs & Trunks4.avif': { brand: 'Calvin Klein', name: 'Cotton Trunks' },
  'casual1.avif': { brand: 'Onitsuka Tiger', name: 'Colorblock Casual Shoes' },
  'casual4.avif': { brand: 'ASICS', name: 'Textured Casual Shoes' },
  'casual5.avif': { brand: 'Bally', name: 'Leather Driving Shoes' },
  'formal1.avif': { brand: 'Bugatti', name: 'Brown Leather Loafers' },
  'Personal Care & Grooming1.avif': { brand: 'The Man Company', name: 'Face Care Kit' },
  'Personal Care & Grooming10.avif': { brand: 'O3+ Men', name: 'Alpha Glow Facial Kit' },
  'Personal Care & Grooming2.avif': { brand: 'Nivea Men', name: 'Oil Control Face Wash' },
  'Personal Care & Grooming3.avif': { brand: 'Vega', name: 'Beard Trimmer' },
  'Personal Care & Grooming4.avif': { brand: 'Fiama Men', name: 'Refreshing Pulse Gel Bar' },
  'Personal Care & Grooming5.avif': { brand: 'Nivea Men', name: 'Deep Impact Roll-On' },
  'Personal Care & Grooming6.avif': { brand: 'Ustraa', name: 'Hair Removal Cream Spray' },
  'Personal Care & Grooming7.avif': { brand: 'Garnier Men', name: 'Acno Fight Face Wash' },
  'Personal Care & Grooming8.avif': { brand: 'Hues For Him', name: 'Beard Fill & Grow Pen' },
  'Personal Care & Grooming9.avif': { brand: 'Beardo', name: 'Whisky Smoke Perfumed Soap' },
  'Wallets2.avif': { brand: 'Baggit', name: 'Green Card Wallet' },
  'Wallets3.avif': { brand: 'Napa Hide', name: 'Green Leather Wallet' },
  'Wallets5.avif': { brand: 'Tommy Hilfiger', name: 'Black Leather Wallet' },
  'perfume1.avif': { brand: 'The Man Company', name: 'Destiny Eau De Parfum' },
  'perfume2.avif': { brand: 'Cantabil', name: 'Premium Body Spray Combo' },
  'perfume3.avif': { brand: "Layer'r", name: 'Shot Iconic Body Spray' },
  'perfume4.avif': { brand: 'Wild Stone', name: 'Code Noir Body Perfume' },
  'setting mist.avif': { brand: 'The Man Company', name: 'Privilege Bold Body Spray' },
  'shorts4.avif': { brand: 'AllSaints', name: 'Regular Fit Shorts' },
  'sneakers3.avif': { brand: 'Onitsuka Tiger', name: 'Mexico 66 Sneakers' },
  'sneakers5.avif': { brand: 'Onitsuka Tiger', name: 'Slip-On Sneakers' },
  'socks2.avif': { brand: 'BOSS', name: 'Ankle Socks Pack' },
  'socks3.avif': { brand: 'BOSS', name: 'No-Show Socks Pack' },
  'socks4.avif': { brand: 'BOSS', name: 'Crew Socks Pack' },
  'sunglasses1.avif': { brand: 'Ray-Ban', name: 'Aviator Sunglasses' },
  'sunglasses10.avif': { brand: 'Ray-Ban', name: 'Rimless Sunglasses' },
  'sunglasses2.avif': { brand: 'IDEE', name: 'Square Sunglasses' },
  'sunglasses5.avif': { brand: 'Ray-Ban', name: 'Square Sunglasses With Case' },
  'sunglasses7.avif': { brand: 'Vogue', name: 'Shield Sunglasses' },
  'thermal2.avif': { brand: 'Columbia', name: 'Thermal Base Layer Top' },
  'thermal3.avif': { brand: 'Columbia', name: 'Thermal Top Pack' },
  'thermal4.avif': { brand: 'Columbia', name: 'Grey Thermal Top' },
  'trackpant5relaxed_fit_sweatpants.avif': { brand: 'AllSaints', name: 'Relaxed Fit Sweatpants' },
  'Trackpant10.avif': { brand: 'BOSS', name: 'Regular Fit Track Pants' },
  'tracpant6.avif': { brand: 'BOSS', name: 'Slim Fit Track Pants' },
  'trouser4.avif': { brand: 'BOSS', name: 'Tapered Formal Trouser' },
  'watch2.avif': { brand: 'Vacheron Constantin', name: 'Overseas Automatic Watch' },
  'watch4.avif': { brand: 'Fossil', name: 'Chronograph Watch' },
  'watch5.avif': { brand: 'Casio', name: 'Edifice Analog Watch' },
  'watch7.avif': { brand: 'Casio', name: 'Green Dial Analog Watch' },
  'watch8.avif': { brand: 'Daniel Klein', name: 'Chronograph Watch' },
  'watches.avif': { brand: 'Guess', name: 'Two-Tone Analog Watch' },
};

const brandFromFileName: Record<string, string> = {
  all_saints: 'All Saints',
  ausk: 'AUSK',
  boss: 'BOSS',
  coach: 'Coach',
  diesel: 'Diesel',
  emporio_armani: 'Emporio Armani',
  garimaknitwear: 'Garima Knitwear',
  krstitch: 'KRSTITCH',
  mathra: 'MD By Mathra Dass',
  trendstalk: 'TrendsTalk',
};

const apparelSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const footwearSizes = ['6', '7', '8', '9', '10', '11'];
const apparelSlugs = new Set([
  't-shirts',
  'casual-shirts',
  'formal-shirts',
  'jackets',
  'blazers-coats',
  'jeans',
  'formal-trousers',
  'shorts',
  'track-pants-joggers',
  'kurtas-kurta-sets',
  'sherwanis',
  'nehru-jackets',
  'briefs-trunks',
  'boxers',
  'vests',
  'thermals',
  'swimwear',
  'plus-size',
]);
const footwearSlugs = new Set(['casual-shoes', 'formal-shoes', 'sneakers']);

function getSizesForSlug(slug: string) {
  if (footwearSlugs.has(slug)) return footwearSizes;
  if (apparelSlugs.has(slug)) return apparelSizes;
  return undefined;
}

function getBrandFromFile(fileName: string) {
  const normalized = fileName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const match = Object.entries(brandFromFileName).find(([key]) => normalized.includes(key));
  return match?.[1];
}

function getNameFromFile(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  if (/^[a-z\s&_-]+\d+$/i.test(baseName) || /^[a-z]+$/i.test(baseName)) return undefined;

  return baseName
    .replace(/^(all_saints|ausk|boss|coach|diesel|emporio_armani|krstitch|md_by_mathra_dass|trendstalk)[_-]*/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function getCategoryForSlug(slug: string) {
  return Object.values(categoryGroups).find((group) => group.slugs.includes(slug))?.title.replace(/^Men\s/, '');
}

function makeProducts(slug: string, startId = 1): Product[] {
  const item = catalog[slug];
  if (!item) return [];
  const subCategory = item.title.replace(/^Men\s/, '');
  const category = getCategoryForSlug(slug);
  const sizes = getSizesForSlug(slug);
  const colors = ['Black', 'Blue', 'White', 'Grey', 'Green'];
  const fits = ['Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Oversized'];
  const names = productNamesBySlug[slug] || [item.description];

  return item.files.map((file, index) => {
    const price = getCatalogPrice(slug, index);
    const originalPrice = getCatalogOriginalPrice(price, index);

    return {
      id: startId + index,
      brand: productDetailsByFile[file]?.brand || getBrandFromFile(file) || item.brands[index % item.brands.length],
      name: productDetailsByFile[file]?.name || getNameFromFile(file) || names[index % names.length],
      description: item.description,
      category,
      subCategory,
      size: sizes?.[index % sizes.length],
      color: colors[index % colors.length],
      fit: fits[index % fits.length],
      price,
      originalPrice,
      discount: getCatalogDiscount(price, originalPrice),
      image: imagePath(file),
    };
  });
}

function buildConfig(section: string): CategoryConfig {
  const slug = aliases[section] || section;
  const group = categoryGroups[slug];
  const productSlugs = group?.slugs || [slug];
  const firstItem = catalog[productSlugs[0]];
  const title = group?.title || catalog[slug]?.title || 'Men Topwear';
  const products = productSlugs.flatMap((itemSlug, groupIndex) => makeProducts(itemSlug, groupIndex * 100 + 1));
  const brands = Array.from(new Set(products.map((product) => product.brand)));
  const sizeOptions = Array.from(
    new Set(products.map((product) => product.size).filter(Boolean)),
  ) as string[];
  const subCategoryOptions = productSlugs.map((itemSlug) => catalog[itemSlug]?.title.replace(/^Men\s/, '')).filter(Boolean);

  return {
    title,
    totalProducts: products.length,
    accentColor: '#ec4899',
    brands: (brands.length ? brands : firstItem?.brands || []).slice(0, 6),
    filters: [
      { label: 'Sub-Categories', options: subCategoryOptions.length ? subCategoryOptions : [title.replace(/^Men\s/, '')] },
      { label: 'Brands', options: brands.length ? brands : firstItem?.brands || [] },
      ...(sizeOptions.length ? [{ label: 'Size', options: sizeOptions }] : []),
      ...commonFilters,
    ],
    products: products.length ? products : makeProducts('t-shirts'),
  };
}

export default function MenSectionPage() {
  const params = useParams();
  const section = params.section as string;

  return <ProductListingPage config={buildConfig(section)} />;
}
