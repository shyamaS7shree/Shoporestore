'use client';

import ProductListingPage from '@/components/ProductListingPage';
import { buildCatalogConfig } from '@/lib/productCatalog';
import { useParams } from 'next/navigation';

const imageDir = '/Home';

const commonFilters = [
  { label: 'Material', options: ['Cotton', 'Ceramic', 'Wood', 'Glass', 'Metal', 'Microfiber'] },
  { label: 'Color', options: ['White', 'Beige', 'Brown', 'Blue', 'Grey', 'Green', 'Gold'] },
  { label: 'Price', options: ['Under Rs. 300', 'Under Rs. 500', 'Under Rs. 1,000', 'Under Rs. 5,000'] },
  { label: 'Discount', options: ['70% and above', '60% and above', '50% and above', '40% and above'] },
];

const catalog = {
  'bed-sheets': { title: 'Home Bed Sheets', description: 'Bed Sheet', brands: ['Spaces', 'DDecor', 'Raymond Home', 'Story@Home'], files: ['Bed Sheets1.avif', 'Bed Sheets2.avif', 'Bed Sheets3.avif', 'Bed Sheets4.avif', 'Bed Sheets5.avif'] },
  'mattress-protectors': { title: 'Home Mattress Protectors', description: 'Mattress Protector', brands: ['Wakefit', 'SleepyCat', 'Spaces', 'Trance Home Linen'], files: ['Mattress Protectors1.avif', 'Mattress Protectors2.avif', 'Mattress Protectors3.avif', 'Mattress Protectors4.avif', 'Mattress Protectors5.avif'] },
  'blankets-quilts-dohars': { title: 'Home Blankets, Quilts & Dohars', description: 'Blanket, Quilt & Dohar', brands: ['DDecor', 'Spaces', 'Portico', 'Home Centre'], files: ['Blankets, Quilts & Dohars1.avif', 'Blankets, Quilts & Dohars2.avif', 'Blankets, Quilts & Dohars3.avif', 'Blankets, Quilts & Dohars4.avif', 'Blankets, Quilts & Dohars5.avif'] },
  'pillows-pillow-covers': { title: 'Home Pillows & Pillow Covers', description: 'Pillow & Pillow Cover', brands: ['SleepyCat', 'Wakefit', 'Spaces', 'DDecor'], files: ['Pillows & Pillow Covers1.avif', 'Pillows & Pillow Covers2.avif', 'Pillows & Pillow Covers3.avif', 'Pillows & Pillow Covers4.avif', 'Pillows & Pillow Covers5.avif'] },
  'bed-covers': { title: 'Home Bed Covers', description: 'Bed Cover', brands: ['Portico', 'Spaces', 'DDecor', 'Raymond Home'], files: ['Bed Covers1.avif', 'Bed Covers2.avif', 'Bed Covers3.avif', 'Bed Covers4.avif', 'Bed Covers5.avif'] },
  'diwan-sets': { title: 'Home Diwan Sets', description: 'Diwan Set', brands: ['Story@Home', 'DDecor', 'Home Centre', 'Spaces'], files: ['Diwan Sets1.avif', 'Diwan Sets2.avif', 'Diwan Sets3.avif', 'Diwan Sets4.avif', 'Diwan Sets5.avif'] },
  'chair-pads-covers': { title: 'Home Chair Pads & Covers', description: 'Chair Pad & Cover', brands: ['Home Centre', 'Story@Home', 'DDecor', 'Portico'], files: ['Chair Pads & Covers1.avif', 'Chair Pads & Covers2.avif', 'Chair Pads & Covers3.avif', 'Chair Pads & Covers4.avif', 'Chair Pads & Covers5.avif'] },
  'sofa-covers': { title: 'Home Sofa Covers', description: 'Sofa Cover', brands: ['Story@Home', 'DDecor', 'Home Centre', 'Spaces'], files: ['Sofa Covers1.avif', 'Sofa Covers2.avif', 'Sofa Covers3.avif', 'Sofa Covers4.avif', 'Sofa Covers5.avif'] },
  'floor-runners': { title: 'Home Floor Runners', description: 'Floor Runner', brands: ['Obeetee', 'Jaipur Rugs', 'Home Centre', 'DDecor'], files: ['Floor Runners1.avif', 'Floor Runners2.avif', 'Floor Runners3.avif', 'Floor Runner4.avif'] },
  carpets: { title: 'Home Carpets', description: 'Carpet', brands: ['Obeetee', 'Jaipur Rugs', 'DDecor', 'Home Centre'], files: ['Carpets1.avif', 'Carpets2.avif', 'Carpets3.avif', "Carpets4'.avif", 'Carpets5.avif', 'Carpets6.avif'] },
  'floor-mats-dhurries': { title: 'Home Floor Mats & Dhurries', description: 'Floor Mat & Dhurrie', brands: ['Obeetee', 'Jaipur Rugs', 'Story@Home', 'Home Centre'], files: ['Floor Mats & Dhurries1.avif', 'Floor Mats & Dhurries2.avif', 'Floor Mats & Dhurries3.avif', 'Floor Mats & Dhurries4.avif', 'Floor Mats & Dhurries5.avif'] },
  'door-mats': { title: 'Home Door Mats', description: 'Door Mat', brands: ['Story@Home', 'Home Centre', 'DDecor', 'Spaces'], files: ['Door Mats1.avif', 'Door Mats2.avif', 'Door Mats3.avif', 'Door Mats4.avif', 'Door Mats5.avif'] },
  'bath-towels': { title: 'Home Bath Towels', description: 'Bath Towel', brands: ['Spaces', 'Bombay Dyeing', 'Trident', 'Raymond Home'], files: ['Bath Towels1.avif', 'Bath Towels2.avif', 'Bath Towels3.avif', 'Bath Towels4.avif'] },
  'hand-face-towels': { title: 'Home Hand & Face Towels', description: 'Hand & Face Towel', brands: ['Spaces', 'Bombay Dyeing', 'Trident', 'Raymond Home'], files: ['Hand & Face Towels1.avif', 'Hand & Face Towels2.avif', 'Hand & Face Towels3.avif', 'Hand & Face Towels4.avif', 'Hand & Face Towels5.avif'] },
  'beach-towels': { title: 'Home Beach Towels', description: 'Beach Towel', brands: ['Spaces', 'Trident', 'Bombay Dyeing', 'Home Centre'], files: ['Beach Towels1.avif', 'Beach Towels2.avif', 'Beach Towels3.avif', 'Beach Towels4.avif', 'Beach Towels5.avif'] },
  'towels-set': { title: 'Home Towels Set', description: 'Towels Set', brands: ['Spaces', 'Bombay Dyeing', 'Trident', 'Raymond Home'], files: ['Towels Set1.avif', 'Towels Set2.avif', 'Towels Set3.avif', 'Towels Set4.avif', 'Towels Set5.avif'] },
  'floor-lamps': { title: 'Home Floor Lamps', description: 'Floor Lamp', brands: ['Philips', 'Homesake', 'Home Centre', 'Ikea'], files: ['Floor Lamps1.avif', 'Floor Lamps2.avif', 'Floor Lamps3.avif', 'Floor Lamps5.avif'] },
  'ceiling-lamps': { title: 'Home Ceiling Lamps', description: 'Ceiling Lamp', brands: ['Philips', 'Homesake', 'Home Centre', 'Ikea'], files: ['Ceiling Lamps1.avif', 'Ceiling Lamps2.avif', 'Ceiling Lamps3.avif', 'Ceiling Lamps4.avif', 'Ceiling Lamps5.avif'] },
  'table-lamps': { title: 'Home Table Lamps', description: 'Table Lamp', brands: ['Philips', 'Homesake', 'Home Centre', 'Ikea'], files: ['Table Lamps1.avif', 'Table Lamps2.avif', 'Table Lamps3.avif', 'Table Lamps4.avif', 'Table Lamps5.avif'] },
  'wall-lamps': { title: 'Home Wall Lamps', description: 'Wall Lamp', brands: ['Philips', 'Homesake', 'Home Centre', 'Ikea'], files: ['Wall Lamps1.avif', 'Wall Lamps2.avif', 'Wall Lamps3.avif', 'Wall Lamps4.avif', 'Wall Lamps5.avif'] },
  clocks: { title: 'Home Clocks', description: 'Clock', brands: ['Casio', 'Ajanta', 'Home Centre', 'Story@Home'], files: ['clock1.avif', 'clock2.avif', 'clock3.avif', 'clock4.avif', 'clock5.avif'] },
  mirrors: { title: 'Home Mirrors', description: 'Mirror', brands: ['Home Centre', 'Ikea', 'Story@Home', 'DDecor'], files: ['mirror1.avif', 'mirror2.avif', 'mirror3.avif', 'mirror4.avif', 'mirror5.avif'] },
  'pooja-essentials': { title: 'Home Pooja Essentials', description: 'Pooja Essential', brands: ['Aapno Rajasthan', 'Home Centre', 'CraftVatika', 'Story@Home'], files: ['pujaessential1.avif', 'pujaessential2.avif', 'pujaessential3.avif', 'pujaessential4.avif', 'pujaessential5.avif'] },
  'wall-shelves': { title: 'Home Wall Shelves', description: 'Wall Shelf', brands: ['Ikea', 'Home Centre', 'Story@Home', 'Wooden Street'], files: ['wallshelves1.avif', 'wallshelves2.avif', 'wallshelves3.avif', 'wallshelves4.avif', 'wallshelves5.avif'] },
  fountains: { title: 'Home Fountains', description: 'Fountain', brands: ['CraftVatika', 'Home Centre', 'Story@Home', 'Aapno Rajasthan'], files: ['fountain1.avif', 'fountain2.avif', 'fountain3.avif', 'fountain4.avif', 'fountain5.avif'] },
  'showpieces-vases': { title: 'Home Showpieces & Vases', description: 'Showpiece & Vase', brands: ['Home Centre', 'CraftVatika', 'Story@Home', 'Aapno Rajasthan'], files: ['showpieces1.avif', 'showpieces2.avif', 'showpieces3.avif', 'showpieces4.avif', 'showpieces5.avif'] },
  ottoman: { title: 'Home Ottoman', description: 'Ottoman', brands: ['Home Centre', 'Ikea', 'Wooden Street', 'Story@Home'], files: ['ottoman1.avif', 'ottoman2.avif', 'ottoman3.avif', 'ottoman4.avif', 'ottoman5.avif'] },
  'cushions-cushion-covers': { title: 'Home Cushions & Cushion Covers', description: 'Cushion & Cushion Cover', brands: ['DDecor', 'Spaces', 'Home Centre', 'Story@Home'], files: ['cushions1.avif', 'cushions2.avif', 'cushions3.avif', 'cushions4.avif', 'cushions5.avif'] },
  'home-gift-sets': { title: 'Home Gift Sets', description: 'Gift Set', brands: ['Home Centre', 'CraftVatika', 'Story@Home', 'Aapno Rajasthan'], files: ['giftset1.avif', 'giftset2.avif', 'giftset3.avif', 'giftset4.avif', 'giftset5.avif'] },
  'dinnerware-serveware': { title: 'Home Dinnerware & Serveware', description: 'Dinnerware & Serveware', brands: ['Corelle', 'Borosil', 'LaOpala', 'Home Centre'], files: ['dinner1.avif', 'dinner2.avif', 'dinner3.avif', 'dinner4.avif', 'dinner5.avif'] },
  'cups-and-mugs': { title: 'Home Cups and Mugs', description: 'Cup & Mug', brands: ['Borosil', 'Corelle', 'LaOpala', 'Home Centre'], files: ['cups1.avif', 'cups2.avif', 'cups3.avif', 'cups4.avif', 'cups5.avif'] },
  'bar-drinkware': { title: 'Home Bar & Drinkware', description: 'Bar & Drinkware', brands: ['Borosil', 'Corelle', 'LaOpala', 'Home Centre'], files: ['drinkware1.avif', 'drinkware2.avif', 'drinkware3.avif', 'drinkware4.avif', 'drinkware5.avif'] },
  'table-covers-furnishings': { title: 'Home Table Covers & Furnishings', description: 'Table Cover & Furnishing', brands: ['DDecor', 'Spaces', 'Home Centre', 'Story@Home'], files: ['tablecover1.avif', 'tablecover2.avif', 'tablecover3.avif', 'tablecover4.avif', 'tablecover5.avif'] },
  bins: { title: 'Home Bins', description: 'Bin', brands: ['Cello', 'Nilkamal', 'Home Centre', 'Ikea'], files: ['bin1.avif', 'bin2.avif', 'bin3.avif', 'bin4.avif', 'bin5.avif'] },
  hangers: { title: 'Home Hangers', description: 'Hanger', brands: ['Ikea', 'Home Centre', 'Nilkamal', 'Cello'], files: ['hangers1.avif', 'hangers2.avif', 'hangers3.avif', 'hangers4.avif', 'hangers5.avif'] },
  organisers: { title: 'Home Organisers', description: 'Organiser', brands: ['Ikea', 'Home Centre', 'Nilkamal', 'Cello'], files: ['organiser1.avif', 'organiser2.avif', 'organiser3.avif', 'organiser4.avif', 'organiser5.avif'] },
  kitchen: { title: 'Home Kitchen Essentials', description: 'Kitchen Essential', brands: ['Borosil', 'Prestige', 'Cello', 'Home Centre'], files: ['kitchen1.avif', 'kitchen2.avif', 'kitchen3.avif', 'kitchen4.avif', 'kitchen5.avif'] },
  'home-decor': { title: 'Home Decor', description: 'Home Decor', brands: ['Home Centre', 'CraftVatika', 'Story@Home', 'Aapno Rajasthan'], files: ['homedecor1.avif', 'homedecor2.avif', 'homedecor3.avif', 'homedecor4.avif', 'homedecor5.avif'] },
};

const groups = {
  'bed-linen-furnishing': { title: 'Home Bed Linen & Furnishing', slugs: ['bed-sheets', 'mattress-protectors', 'blankets-quilts-dohars', 'pillows-pillow-covers', 'bed-covers', 'diwan-sets', 'chair-pads-covers', 'sofa-covers'] },
  flooring: { title: 'Home Flooring', slugs: ['floor-runners', 'carpets', 'floor-mats-dhurries', 'door-mats'] },
  bath: { title: 'Home Bath', slugs: ['bath-towels', 'hand-face-towels', 'beach-towels', 'towels-set'] },
  'lamps-lighting': { title: 'Home Lamps & Lighting', slugs: ['floor-lamps', 'ceiling-lamps', 'table-lamps', 'wall-lamps'] },
  'home-decor': { title: 'Home Decor', slugs: ['clocks', 'mirrors', 'pooja-essentials', 'wall-shelves', 'fountains', 'showpieces-vases', 'ottoman', 'home-decor'] },
  'kitchen-table': { title: 'Home Kitchen & Table', slugs: ['dinnerware-serveware', 'cups-and-mugs', 'bar-drinkware', 'table-covers-furnishings', 'kitchen'] },
  storage: { title: 'Home Storage', slugs: ['bins', 'hangers', 'organisers'] },
  'home-bath': { title: 'Home & Bath', slugs: ['bed-sheets', 'bath-towels', 'hand-face-towels', 'towels-set', 'cushions-cushion-covers'] },
};

const aliases = {
  'home-dcor': 'home-decor',
  'home-dã©cor': 'home-decor',
  'home-decor': 'home-decor',
  'home-décor': 'home-decor',
  'showpieces-and-vases': 'showpieces-vases',
  'cups-mugs': 'cups-and-mugs',
  'cushions': 'cushions-cushion-covers',
  'cushions-covers': 'cushions-cushion-covers',
  'home-gift-set': 'home-gift-sets',
  'gift-sets': 'home-gift-sets',
  'wall-shelf': 'wall-shelves',
  'pooja-essential': 'pooja-essentials',
  'shower-curtains': 'bath',
};

export default function HomeSectionPage() {
  const params = useParams();
  const section = params.section as string;

  return (
    <ProductListingPage
      config={buildCatalogConfig({
        section,
        accentColor: '#eab308',
        defaultSlug: 'bed-sheets',
        fallbackTitle: 'Home & Living',
        imageDir,
        catalog,
        groups,
        aliases,
        commonFilters,
        stripPrefix: /^Home\s/,
      })}
    />
  );
}
