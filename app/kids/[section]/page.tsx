'use client';

import ProductListingPage from '@/components/ProductListingPage';
import { buildCatalogConfig } from '@/lib/productCatalog';
import { useParams } from 'next/navigation';

const imageDir = '/kids section';

const commonFilters = [
  { label: 'Size', options: ['0-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y'] },
  { label: 'Color', options: ['Blue', 'Pink', 'Red', 'Yellow', 'Black', 'White', 'Green'] },
  { label: 'Price', options: ['Under Rs. 300', 'Under Rs. 500', 'Under Rs. 1,000', 'Under Rs. 5,000'] },
  { label: 'Discount', options: ['60% and above', '50% and above', '40% and above', '30% and above'] },
];

const catalog = {
  't-shirts': { title: 'Kids T-Shirts', description: 'T-Shirt', brands: ['H&M Kids', 'Max Kids', 'UCB Kids', 'YK'], files: ['T-Shirts1.avif', 'T-Shirts2.avif', 'T-Shirts3.avif', 'T-Shirts4.avif', 'T-Shirts5.avif'] },
  shirts: { title: 'Kids Shirts', description: 'Shirt', brands: ['H&M Kids', 'Max Kids', 'Pantaloons', 'UCB Kids'], files: ['shirt1.avif', 'shirt2.avif', 'shirt3.avif', 'shirt4.avif', "shirt5'.avif"] },
  'clothing-sets': { title: 'Kids Clothing Sets', description: 'Clothing Set', brands: ['Mothercare', 'Max Kids', 'YK', 'Pantaloons'], files: ['set1.avif', 'set2.avif', 'set3.avif', 'set4.avif', 'set5.avif'] },
  'ethnic-wear-boys': { title: 'Boys Ethnic Wear', description: 'Ethnic Wear', brands: ['Manyavar Kids', 'AJ Dezines', 'Max Kids', 'Pantaloons'], files: ['Ethnic Wearboy1.avif', 'Ethnic Wearboy2.avif', 'Ethnic Wearboy3.avif', 'Ethnic Wearboy4.avif', 'Ethnic Wearboy5.avif'] },
  dresses: { title: 'Kids Dresses', description: 'Dress', brands: ['H&M Kids', 'Max Kids', 'Mothercare', 'YK'], files: ['Dress1.avif', 'Dress2.avif', 'Dress3.jpg', 'Dress4.avif', 'Dress5.avif'] },
  tops: { title: 'Kids Tops', description: 'Top', brands: ['H&M Kids', 'Max Kids', 'Pantaloons', 'UCB Kids'], files: ['Tops1.avif', 'Tops2.avif', 'Tops3.avif', 'Tops4.avif', 'Tops5.avif'] },
  tshirts: { title: 'Girls Tshirts', description: 'T-Shirt', brands: ['H&M Kids', 'Max Kids', 'YK', 'UCB Kids'], files: ['Tshirtsgirl1.avif', 'Tshirtsgir2.avif', 'Tshirtsgirl3.avif', 'Tshirtsgirl4.avif', 'Tshirtsgirl5.avif'] },
  'ethnic-wear': { title: 'Girls Ethnic Wear', description: 'Ethnic Wear', brands: ['Biba Girls', 'Max Kids', 'Mothercare', 'Pantaloons'], files: ['Ethnic Wear1.avif', 'Ethnic Wear2.avif', 'Ethnic Wear3.avif', 'Ethnic Wear4.avif', 'Ethnic Wear5.avif'] },
  'casual-shoes': { title: 'Kids Casual Shoes', description: 'Casual Shoes', brands: ['Bata Kids', 'Kittens', 'Puma Kids', 'Nike Kids'], files: ['Casual Shoes1.avif', 'Casual Shoes2.avif', 'Casual Shoes3.avif', 'Casual Shoes4.avif', 'Casual Shoes5.avif'], sizes: ['1C', '2C', '3C', '4C', '5C', '1Y', '2Y'] },
  flipflops: { title: 'Kids Flipflops', description: 'Flipflops', brands: ['Bata Kids', 'Crocs', 'Kittens', 'Lilliput'], files: ['Flipflops1.avif', 'Flipflops2.avif', 'Flipflops3.avif', 'Flipflops4.avif', 'Flipflops5.avif'], sizes: ['1C', '2C', '3C', '4C', '5C', '1Y', '2Y'] },
  'sports-shoes': { title: 'Kids Sports Shoes', description: 'Sports Shoes', brands: ['Nike Kids', 'Adidas Kids', 'Puma Kids', 'Skechers'], files: ['sportsshoes1.avif', 'sportshoes2.avif', 'sportshoes3.avif', 'sportshoes4.avif', 'sportshoes5.avif'], sizes: ['1C', '2C', '3C', '4C', '5C', '1Y', '2Y'] },
  flats: { title: 'Kids Flats', description: 'Flats', brands: ['Kittens', 'Bata Kids', 'Lilliput', 'Crocs'], files: ['flats1.avif', 'flats2.avif', 'flats3.avif', 'flats4.avif', 'flats5.avif'], sizes: ['1C', '2C', '3C', '4C', '5C', '1Y', '2Y'] },
  'learning-development': { title: 'Kids Learning & Development', description: 'Learning Toy', brands: ['Hamleys', 'Funskool', 'Skillmatics', 'Fisher-Price'], files: ['Learning & Development1.avif', 'Learning & Development2.avif', 'Learning & Development3.avif', 'Learning & Development4.avif', 'Learning & Development5.avif'] },
  'activity-toys': { title: 'Kids Activity Toys', description: 'Activity Toy', brands: ['Hamleys', 'Funskool', 'Hot Wheels', 'Lego'], files: ['Activity Toys1.avif', 'Activity Toys2.avif', 'Activity Toys3.avif', 'Activity Toys4.avif', 'Activity Toys5.avif'] },
  'soft-toys': { title: 'Kids Soft Toys', description: 'Soft Toy', brands: ['Hamleys', 'Miniso', 'Fisher-Price', 'Disney'], files: ['Soft Toys1.avif', 'Soft Toys2.avif', 'Soft Toys3.avif', 'Soft Toys4.avif', 'Soft Toys5.avif'] },
  bodysuits: { title: 'Kids Bodysuits', description: 'Bodysuit', brands: ['Mothercare', 'H&M Baby', "Carter's", 'Babyhug'], files: ['Bodysuits1.avif', 'Bodysuits2.avif', 'Bodysuits3.avif', 'Bodysuits4.avif', 'Bodysuits5.avif', 'Bodysuits6.avif'] },
  'rompers-sleepsuits': { title: 'Kids Rompers & Sleepsuits', description: 'Rompers & Sleepsuits', brands: ['Mothercare', 'Babyhug', 'H&M Baby', "Carter's"], files: ['Rompers & Sleepsuits1.avif', 'Rompers & Sleepsuits2.avif', 'Rompers & Sleepsuits3.avif', 'Rompers & Sleepsuits4.avif', 'Rompers & Sleepsuits5.avif'] },
  'home-bath': { title: 'Kids Home & Bath', description: 'Home & Bath', brands: ['Mothercare', 'Babyhug', 'Mee Mee', 'Chicco'], files: ['Home & Bath1.avif', 'Home & Bath2.avif', 'Home & Bath3.avif', 'Home & Bath4.avif', 'Home & Bath5.avif'] },
  'personal-care': { title: 'Kids Personal Care', description: 'Personal Care', brands: ["Johnson's", 'Himalaya Baby', 'Chicco', 'Mamaearth'], files: ['Personal Care1.avif', 'Personal Care2.avif', 'Personal Care3.avif', 'Personal Care4.avif', 'Personal Care5.avif'] },
};

const groups = {
  'boys-clothing': { title: 'Boys Clothing', slugs: ['t-shirts', 'shirts', 'clothing-sets', 'ethnic-wear-boys'] },
  'girls-clothing': { title: 'Girls Clothing', slugs: ['dresses', 'tops', 'tshirts', 'ethnic-wear'] },
  footwear: { title: 'Kids Footwear', slugs: ['casual-shoes', 'flipflops', 'sports-shoes', 'flats'] },
  'toys-games': { title: 'Kids Toys & Games', slugs: ['learning-development', 'activity-toys', 'soft-toys'] },
  infants: { title: 'Kids Infants', slugs: ['bodysuits', 'rompers-sleepsuits', 'clothing-sets', 'dresses'] },
};

export default function KidsSectionPage() {
  const params = useParams();
  const section = params.section as string;

  return (
    <ProductListingPage
      config={buildCatalogConfig({
        section,
        accentColor: '#f97316',
        defaultSlug: 't-shirts',
        fallbackTitle: 'Kids Fashion',
        imageDir,
        catalog,
        groups,
        aliases: { 'home-bath': 'home-bath', 'personal-care': 'personal-care' },
        commonFilters,
        stripPrefix: /^(Kids|Boys|Girls)\s/,
      })}
    />
  );
}
