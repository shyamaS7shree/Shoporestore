'use client';

import ProductListingPage from '@/components/ProductListingPage';
import { buildCatalogConfig } from '@/lib/productCatalog';
import { useParams } from 'next/navigation';

const imageDir = '/Women section';

const commonFilters = [
  { label: 'Size', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Color', options: ['Black', 'White', 'Blue', 'Pink', 'Red', 'Green', 'Yellow'] },
  { label: 'Price', options: ['Under Rs. 300', 'Under Rs. 500', 'Under Rs. 1,000', 'Under Rs. 5,000'] },
  { label: 'Discount', options: ['70% and above', '60% and above', '50% and above', '40% and above'] },
];

const catalog = {
  dresses: { title: 'Women Dresses', description: 'Dress', brands: ['H&M', 'Zara', 'AND', 'Global Desi'], files: ['dress1.avif', 'dress2.avif', 'dress3.avif', 'dress4.avif', 'dress5.avif'] },
  tops: { title: 'Women Tops', description: 'Top', brands: ['Vero Moda', 'ONLY', 'Zara', 'AND'], files: ['top1.avif', 'top2.avif', 'top3.avif', 'top4.avif', 'top5.avif'] },
  tshirts: { title: 'Women Tshirts', description: 'T-Shirt', brands: ['H&M', 'Mango', 'Levis', 'U.S. Polo Assn.'], files: ['t-shirt1.avif', 't-shirt2.avif', 't-shirt3.avif', 't-shirt4.avif', 't-shirt5.avif'] },
  jeans: { title: 'Women Jeans', description: 'Jeans', brands: ['Levis', 'ONLY', 'Vero Moda', 'Flying Machine'], files: ['jeans1.avif', 'jeans2.avif', 'jeans3.avif', 'jeans4.avif', 'jeans5.avif'] },
  'trousers-capris': { title: 'Women Trousers & Capris', description: 'Trouser & Capri', brands: ['Van Heusen', 'AND', 'Zara', 'Allen Solly'], files: ['Trousers & Capris1.avif', 'Trousers & Capris2.avif', 'Trousers & Capris3.avif', 'Trousers & Capris4.avif', 'Trousers & Capris5.avif'] },
  'sweaters-sweatshirts': { title: 'Women Sweaters & Sweatshirts', description: 'Sweater & Sweatshirt', brands: ['H&M', 'ONLY', 'Mango', 'Zara'], files: ['Sweaters & Sweatshirts1.avif', 'Sweaters & Sweatshirts2.avif', 'Sweaters & Sweatshirts3.avif', 'Sweaters & Sweatshirts4.avif', 'Sweaters & Sweatshirts5.avif'] },
  'jackets-coats': { title: 'Women Jackets & Coats', description: 'Jacket & Coat', brands: ['Mango', 'Zara', 'ONLY', 'Vero Moda'], files: ['Jackets & Coats1.avif', 'Jackets & Coats2.avif', 'Jackets & Coats3.avif', 'Jackets & Coats4.avif', 'Jackets & Coats5.avif'] },
  'blazers-waistcoats': { title: 'Women Blazers & Waistcoats', description: 'Blazer & Waistcoat', brands: ['Van Heusen', 'Allen Solly', 'Zara', 'Mango'], files: ['Blazers & Waistcoats1.avif', 'Blazers & Waistcoats2.avif', 'Blazers & Waistcoats3.avif', 'Blazers & Waistcoats4.avif', 'Blazers & Waistcoats5.avif'] },
  'kurtas-suits': { title: 'Women Kurtas & Suits', description: 'Kurta & Suit', brands: ['Biba', 'W', 'Libas', 'Aurelia'], files: ['Kurtas & Suits1.avif', 'Kurtas & Suits2.avif', 'Kurtas & Suits3.avif', 'Kurtas & Suits4.avif', 'Kurtas & Suits5.avif'] },
  'kurtis-tops': { title: 'Women Kurtis & Tops', description: 'Kurti & Top', brands: ['W', 'Biba', 'Aurelia', 'Soch'], files: ['Kurtis, Tunics & Tops1.avif', 'Kurtis, Tunics & Tops2.avif', 'Kurtis, Tunics & Tops3.avif', 'Kurtis, Tunics & Tops4.avif', 'Kurtis, Tunics & Tops5.avif'] },
  sarees: { title: 'Women Sarees', description: 'Saree', brands: ['Kashish', 'Soch', 'Biba', 'Aurelia'], files: ['saree1.avif', 'cotton_silk_saree2.avif', 'embellished_saree3.avif', 'printed_saree4.avif', 'traditional_saree5.avif'] },
  'ethnic-wear': { title: 'Women Ethnic Wear', description: 'Ethnic Wear', brands: ['Global Desi', 'Biba', 'W', 'Fabindia'], files: ['Ethnic Wear1.avif', 'Ethnic Wear2.avif', 'Ethnic Wear3.avif', 'Ethnic Wear4.avif', 'Ethnic Wear5.avif'] },
  leggings: { title: 'Women Leggings', description: 'Leggings', brands: ['Go Colors', 'Aurelia', 'W', 'Jockey'], files: ['leggings1.avif', 'leggings2.avif', 'leggings3.avif', 'leggings4.avif', 'leggings5.avif'] },
  'skirts-palazzos': { title: 'Women Skirts & Palazzos', description: 'Skirt & Palazzo', brands: ['Biba', 'Global Desi', 'Aurelia', 'W'], files: ['Skirts & Palazzos1.avif', 'Skirts & Palazzos2.avif', 'Skirts & Palazzos3.avif', 'Skirts & Palazzos4.avif', 'Skirts & Palazzos5.avif', 'Skirts & Palazzos6.avif', 'Skirts & Palazzos7.avif', 'Skirts & Palazzos8.avif', 'Skirts & Palazzos9.avif', 'Skirts & Palazzos10.avif'] },
  dupattas: { title: 'Women Dupattas', description: 'Dupatta & Shawl', brands: ['Biba', 'Soch', 'W', 'Aurelia'], files: ['Dupattas & Shawls1.avif', 'Dupattas & Shawls2.avif', 'Dupattas & Shawls3.avif', 'Dupattas & Shawls4.avif', 'Dupattas & Shawls5.avif'] },
  jackets: { title: 'Women Jackets', description: 'Ethnic Jacket', brands: ['W', 'Biba', 'Global Desi', 'Soch'], files: ['Jackets1.avif', 'Jackets2.avif', 'Jackets3.avif', 'Jackets4.avif', 'Jackets5.avif'] },
  footwear: { title: 'Women Footwear', description: 'Footwear', brands: ['Metro', 'Bata', 'Catwalk', 'Inc.5'], files: ['Footwear1.avif', 'Footwear2.avif', 'Footwear3.avif', 'Footwear4.avif', 'Footwear5.avif'], sizes: ['3', '4', '5', '6', '7', '8'] },
  'sports-accessories': { title: 'Women Sports Accessories', description: 'Sports Accessory', brands: ['Nike', 'Adidas', 'Puma', 'HRX'], files: ['Sports Accessories1.avif', 'Sports Accessories2.avif', 'Sports Accessories3.avif', 'Sports Accessories4.avif', 'Sports Accessories5.avif'] },
  'sports-equipment': { title: 'Women Sports Equipment', description: 'Sports Equipment', brands: ['Nike', 'Adidas', 'Puma', 'Decathlon'], files: ['Sports Equipment1.avif', 'Sports Equipment2.avif', 'Sports Equipment3.avif', 'Sports Equipment4.avif', 'Sports Equipment5.avif'] },
  bra: { title: 'Women Bra', description: 'Bra', brands: ['Jockey', 'Triumph', 'Clovia', 'Amante'], files: ['bra1.avif', 'bra2.avif', 'bra3.avif', 'bra4.avif', 'bra5.avif'] },
  shapewear: { title: 'Women Shapewear', description: 'Shapewear', brands: ['Zivame', 'Clovia', 'Triumph', 'Amante'], files: ['Shapewear1.avif', 'Shapewear2.avif', 'Shapewear3.avif', 'Shapewear4.avif', 'Shapewear5.avif'] },
  'sleepwear-loungewear': { title: 'Women Sleepwear & Loungewear', description: 'Sleepwear & Loungewear', brands: ['Jockey', 'Clovia', 'Zivame', 'PrettySecrets'], files: ['Sleepwear & Loungewear1.avif', 'Sleepwear & Loungewear2.avif', 'Sleepwear & Loungewear3.avif', 'Sleepwear & Loungewear4.avif', 'Sleepwear & Loungewear5.avif'] },
  makeup: { title: 'Women Makeup', description: 'Makeup', brands: ['Lakme', 'Maybelline', 'Sugar', 'Colorbar'], files: ['Makeup1.avif', 'Makeup2.avif', 'Makeup3.avif', 'Makeup4.avif', 'Makeup5.avif'] },
  skincare: { title: 'Women Skincare', description: 'Skincare', brands: ['Lakme', 'LOreal', 'Mamaearth', 'Nivea'], files: ['Skincare1.avif', 'Skincare2.avif', 'Skincare3.avif', 'Skincare4.avif', 'Skincare5.avif'] },
  'premium-beauty': { title: 'Women Premium Beauty', description: 'Premium Beauty', brands: ['MAC', 'Clinique', 'Estee Lauder', 'Bobbi Brown'], files: ['Premium Beauty1.avif', 'Premium Beauty2.avif', 'Premium Beauty3.avif', 'Premium Beauty4.avif', 'Premium Beauty5.avif'] },
  lipsticks: { title: 'Women Lipsticks', description: 'Lipstick', brands: ['Lakme', 'Maybelline', 'Sugar', 'Colorbar'], files: ['Lipsticks1.avif', 'Lipsticks2.avif', 'Lipsticks3.avif', 'Lipsticks4.avif', 'Lipsticks5.avif'] },
  'fashion-jewellery': { title: 'Women Fashion Jewellery', description: 'Fashion Jewellery', brands: ['Accessorize', 'Zaveri Pearls', 'Voylla', 'Rubans'], files: ['Fashion Jewellery1.avif', 'Fashion Jewellery2.avif', 'Fashion Jewellery3.avif', 'Fashion Jewellery4.avif', 'Fashion Jewellery5.avif'] },
  'fine-jewellery': { title: 'Women Fine Jewellery', description: 'Fine Jewellery', brands: ['CaratLane', 'Mia', 'Candere', 'Giva'], files: ['Fine Jewellery1.avif', 'Fine Jewellery2.avif', 'Fine Jewellery3.avif', 'Fine Jewellery4.avif', 'Fine Jewellery5.avif'] },
  'handbags-bags-wallets': { title: 'Women Handbags, Bags & Wallets', description: 'Handbag', brands: ['Lavie', 'Baggit', 'Caprese', 'Hidesign'], files: ['handbag1.avif', 'handbag2.avif', 'handbag3.avif', 'handbag4.avif', 'handbag5.avif', 'handbag6.avif', 'handbag7.avif', 'handbag8.avif', 'handbag9.avif', 'handbag10.avif'] },
  'belts-scarves': { title: 'Women Belts, Scarves', description: 'Belt & Scarf', brands: ['Accessorize', 'H&M', 'Zara', 'Mango'], files: ['Belts,Scarves1.avif', 'Belts,Scarves2.avif', 'Belts,Scarves3.avif', 'Belts,Scarves4.avif', 'Belts,Scarves5.avif', 'Belts,Scarves6.avif', 'Belts,Scarves7.avif', 'Belts,Scarves8.avif', 'Belts,Scarves9.avif', 'Belts,Scarves10.avif'] },
  'watches-wearables': { title: 'Women Watches & Wearables', description: 'Watch & Wearable', brands: ['Fossil', 'Titan', 'Casio', 'Daniel Klein'], files: ['Watches & Wearables1.avif', 'Watches & Wearables2.avif', 'Watches & Wearables3.avif', 'Watches & Wearables4.avif', 'Watches & Wearables5.avif', 'Watches & Wearables6.avif', 'Watches & Wearables7.avif', 'Watches & Wearables8.avif', 'Watches & Wearables9.avif', 'Watches & Wearables10.avif'] },
  'sunglasses-frames': { title: 'Women Sunglasses & Frames', description: 'Sunglasses & Frames', brands: ['Ray-Ban', 'Vogue', 'IDEE', 'Fastrack'], files: ['Sunglasses & Frames1.avif', 'Sunglasses & Frames2.avif', 'Sunglasses & Frames3.avif', 'Sunglasses & Frames4.avif', 'Sunglasses & Frames5.avif', 'Sunglasses & Frames6.avif', 'Sunglasses & Frames7.avif', 'Sunglasses & Frames8.avif', 'Sunglasses & Frames9.avif', 'Sunglasses & Frames10.avif'] },
  'plus-size': { title: 'Women Plus Size', description: 'Plus Size Clothing', brands: ['Gia', 'Sztori', 'Amydus', 'H&M'], files: ['Plus Size1.avif', 'Plus Size2.avif', 'Plus Size3.avif', 'Plus Size4.avif', 'Plus Size5.avif', 'Plus Size6.avif', 'Plus Size7.avif', 'Plus Size8.avif', 'Plus Size9.avif', 'Plus Size10.avif'] },
};

const groups = {
  'western-wear': { title: 'Women Western Wear', slugs: ['dresses', 'tops', 'tshirts', 'jeans', 'trousers-capris', 'sweaters-sweatshirts', 'jackets-coats', 'blazers-waistcoats'] },
  'indian-fusion-wear': { title: 'Women Indian & Fusion Wear', slugs: ['kurtas-suits', 'kurtis-tops', 'sarees', 'ethnic-wear', 'leggings', 'skirts-palazzos', 'dupattas', 'jackets'] },
  'sports-active-wear': { title: 'Women Sports & Active Wear', slugs: ['footwear', 'sports-accessories', 'sports-equipment'] },
  'lingerie-sleepwear': { title: 'Women Lingerie & Sleepwear', slugs: ['bra', 'shapewear', 'sleepwear-loungewear'] },
  'beauty-personal-care': { title: 'Women Beauty & Personal Care', slugs: ['makeup', 'skincare', 'premium-beauty', 'lipsticks'] },
  jewellery: { title: 'Women Jewellery', slugs: ['fashion-jewellery', 'fine-jewellery'] },
};

const aliases = {
  'kurtis-tunics-tops': 'kurtis-tops',
  'skirts-palazzos': 'skirts-palazzos',
  'dupattas-shawls': 'dupattas',
  'belts-scarves': 'belts-scarves',
  'handbags-bags-wallets': 'handbags-bags-wallets',
};

export default function WomenSectionPage() {
  const params = useParams();
  const section = params.section as string;

  return (
    <ProductListingPage
      config={buildCatalogConfig({
        section,
        accentColor: '#ec4899',
        defaultSlug: 'dresses',
        fallbackTitle: 'Women Fashion',
        imageDir,
        catalog,
        groups,
        aliases,
        commonFilters,
        stripPrefix: /^Women\s/,
      })}
    />
  );
}
