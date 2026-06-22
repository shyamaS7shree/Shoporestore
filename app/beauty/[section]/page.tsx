'use client';

import ProductListingPage from '@/components/ProductListingPage';
import { buildCatalogConfig } from '@/lib/productCatalog';
import { useParams } from 'next/navigation';

const commonFilters = [
  { label: 'Concern', options: ['Daily Care', 'Long Lasting', 'Hydrating', 'Oil Control', 'Travel Friendly'] },
  { label: 'Price', options: ['Under Rs. 300', 'Under Rs. 500', 'Under Rs. 1,000', 'Under Rs. 5,000'] },
  { label: 'Discount', options: ['60% and above', '50% and above', '40% and above', '30% and above'] },
];

const catalog = {
  lipstick: {
    title: 'Beauty Lipstick',
    description: 'Lipstick',
    brands: ['Lakme', 'Maybelline', 'Sugar', 'Colorbar'],
    imageDir: '/body mist/lipstick',
    files: ['-original-imahfsgezzqfuhva.webp', '-original-imahh2zfdtfehg7a.webp', '-original-imahhgzgvet5yss3.webp', '1-8-twin-flame-2-in-1-lipstick-lip-liner-define-fill-smudge-original-imahgzxpkpasgyg3.webp', '2-0-moisture-matte-lipstick-for-12-hour-long-stay-carnation-nude-original-imahcksh6xenszrv.webp', '3-2-ultra-pigmented-creamy-matte-lipstick-mars-original-imahckshjwzzkyud.webp'],
  },
  'lip-liner': {
    title: 'Beauty Lip Liner',
    description: 'Lip Liner',
    brands: ['Mars', 'Swiss Beauty', 'Blue Heaven', 'Faces Canada'],
    imageDir: '/body mist/lipliner',
    files: ['12-shades-waterproof-lip-liner-pencil-set-matte-finish-long-original-imahj4fzvtgzvnpk.webp', 'chocolate-and-brown-lip-liner-1-8-each-2pc-skyboat-original-imagmbhxrfzbezwp.webp', 'curve-lip-liner-with-sharpener-matte-finish-long-lasting-richly-original-imahjv9se4dkrg7s.webp', 'lip-liner-pencil-set-for-women-and-girls-soft-waterproof-kenzy-original-imahe4adyj3vufzp.webp', 'matte-lip-pencil-intense-color-smooth-long-lasting-precision-original-imahmh2garw7zra5.webp'],
  },
  mascara: {
    title: 'Beauty Mascara',
    description: 'Mascara',
    brands: ['Maybelline', 'Mars', 'Lakme', 'Swiss Beauty'],
    imageDir: '/body mist/mascara',
    files: ['-original-imah6zjngp9ufp3q.webp', '-original-imahh2zfznkh74se.webp', '-original-imahh8s7eynnzzzd.webp', '11-2in1-mascara-eyeliner-waterproof-smudge-proof-long-lasting-original-imahkjckghzrzkqa.webp', '12-ultra-curl-long-lasting-fabulash-mascara-mars-original-imahmjj5hbwrazjn.webp'],
  },
  eyeliner: {
    title: 'Beauty Eyeliner',
    description: 'Eyeliner',
    brands: ['Lakme', 'Inglot', 'Maybelline', 'Faces Canada'],
    imageDir: '/dedorant/eyeliner',
    files: ['237-2371415_makeup-clipart-eyeliner-make-up-for-ever-hd.png', '245-2451781_inglot-eyeliner-gel-hd-png-download.png', '5-5-photoface-hd-eyeliner-me-on-original-imahezhubhzmfdas.webp', '671-6717418_long-wear-gel-eyeliner-eye-liner-hd-png.png', 'photoface_liner.webp'],
  },
  'baby-care': {
    title: 'Beauty Baby Care',
    description: 'Baby Care',
    brands: ['Johnson Baby', 'Himalaya Baby', 'Mamaearth', 'Chicco'],
    imageDir: '/body mist/baby mask',
    files: ['babycare1.avif', 'babycare2.avif', 'babycare3.avif', 'babycare4.avif', 'babycare5.avif'],
  },
  masks: {
    title: 'Beauty Masks',
    description: 'Face Mask',
    brands: ['Garnier', 'The Face Shop', 'Mamaearth', 'Lakme'],
    imageDir: '/body mist/baby mask',
    files: ['mask1.avif', 'mask2.avif', 'mask3.avif', 'mask4.avif', 'mask5.avif', 'mask6.avif', 'mask7.avif', 'mask8.avif', 'mask9.avif', 'mask10.avif'],
  },
  shampoo: {
    title: 'Beauty Shampoo',
    description: 'Shampoo',
    brands: ['Dove', 'TRESemme', 'Pantene', 'Head & Shoulders'],
    imageDir: '/dedorant/shampoo',
    files: ['233-2338209_transparent-shampoo-bottle-png-transparent-background-shampoo-bottles.png', '24-244597_tresemme-coconut-milk-and-aloe-vera-shampoo-hd.png', 'pexels-by-natallia-311038782-13573917.jpg', 'pexels-johndetochka-14267487.jpg.jpeg'],
  },
  'hair-oil': {
    title: 'Beauty Hair Oil',
    description: 'Hair Oil',
    brands: ['Parachute', 'Mamaearth', 'WOW', 'Indulekha'],
    imageDir: '/dedorant/hairoil',
    files: ['100-authentic-hair-oil-for-hair-growth-hair-fall-control-original-imahhhhy7fvc6gm6.webp', '100-ml-regular-hair-oil-1-1.webp', '20240619_164737_0000.webp', 'images.jpg'],
  },
  'hair-gel': {
    title: 'Beauty Hair Gel',
    description: 'Hair Gel',
    brands: ['Set Wet', 'Gatsby', 'Beardo', 'Ustraa'],
    imageDir: '/body mist/hair gel',
    files: ['-original-imagnsp56ahgb4rx.webp', '-original-imagqefmpytpdfxm.webp', '-original-imahcgg7kfenvnaf.webp', 'hair-gel-100-casually-cool-medium-hold-hair-gel-50ml-pack-of-2-original-imahg49hpvz8acqg.webp', 'hair-gel-300-water-gloss-hyper-solid-hair-gel-300g-each-pack-of-original-imah4zjbjtxz6qgh.webp'],
  },
  'hair-wax': {
    title: 'Beauty Hair Wax',
    description: 'Hair Wax',
    brands: ['Beardo', 'Ustraa', 'Gatsby', 'Set Wet'],
    imageDir: '/body mist/hair wax',
    files: ['hair-fiber-15-hair-volumizing-powder-wax-strong-hold-matte-original-imah4v9zuxgrtkcz.webp', 'hair-wax-100-spf-wax-strong-hold-anti-dandruff-tru-hair-skin-original-imahnfbhy3cvhgyt.webp', 'hair-wax-50-natural-hair-wax-strong-hold-anti-dandruff-argan-original-imahbvggzefbzjgh.webp', 'hair-wax-50-xxtra-strong-hold-hair-wax-beardo-original-imahjgpt9v9r4twv.webp', 'hair-wax-60-0-hair-wax-for-men-glaze-wax-for-healthy-shine-original-imahchygvncazqru.webp', 'hair-wax-75-hair-wax-stick-fl3-edge-control-slick-hair-pomade-original-imahmdzpzfbatw6c.webp'],
  },
  'hair-color': {
    title: 'Beauty Hair Color',
    description: 'Hair Color',
    brands: ['Garnier', 'LOreal', 'Bigen', 'Indus Valley'],
    imageDir: '/body mist/hair color',
    files: ['-original-imah8zpzphnvjhzz.webp', '-original-imahmvyj6s7ynhdf.webp', 'apple-ammonia-free-hair-dye-cream-no-scalp-contact-non-toxic-original-imahn72gvtbz45fm.webp', 'black-hair-color-stick-smooth-apply-natural-black-finish-20g-1-original-imahm9wzj8jnmeeh.webp', 'men-s-beard-colur-b-104-1-bigen-original-imahex6hn6gwzaqm.webp'],
  },
  'hair-serum': {
    title: 'Beauty Hair Serum',
    description: 'Hair Serum',
    brands: ['Livon', 'LOreal', 'Minimalist', 'Dr Reddy'],
    imageDir: '/body mist/hair serum',
    files: ['-original-imagrfdyggqpru6h.webp', '-original-imagv5yn7pphq5mf.webp', '-original-imah8zpztrafnuza.webp', '-original-imahhqehmtukejha.webp', '200-0-hair-serum-for-smooth-frizz-free-glossy-hair-livon-original-imahchyjdrytbyyy.webp'],
  },
  perfume: {
    title: 'Beauty Perfume',
    description: 'Perfume',
    brands: ['Calvin Klein', 'Davidoff', 'Hugo Boss', 'Park Avenue'],
    imageDir: '/dedorant/perfume',
    files: ['free-photo-of-elegant-brown-toned-men-s-fragrance-bottle.jpeg', 'photo-1523293182086-7651a899d37f.avif'],
  },
  deodorant: {
    title: 'Beauty Deodorant',
    description: 'Deodorant',
    brands: ['Fogg', 'Nivea', 'Axe', 'Engage'],
    imageDir: '/dedorant/dedorant',
    files: ['47768-6-deodorant-image-free-download-png-hd.png', 'axe-bodyspray-191361_1280.jpg', 'deodorant-519244_640.png', 'free-photo-of-cosmetic-product-in-black-canister.jpeg', 'novi-sad-serbia-february-pastel-pink-nivea-pearl-beauty-antiperspirant-deodorant-aerosol-can-blue-cap-featuring-classic-440024717.webp'],
  },
  'body-mist': {
    title: 'Beauty Body Mist',
    description: 'Body Mist',
    brands: ['Plum', 'Engage', 'Wottagirl', 'Bath & Body Works'],
    imageDir: '/body mist/body mist',
    files: ['-original-imahk4ayqra6kfuy.webp', '100-bodylovin-vanilla-vibes-long-lasting-vanilla-fragrance-original-imahmnbkqbj6qhnh.webp', '100-coconut-crumble-body-hair-mist-1-body-mist-spritz-by-typsy-original-imahhqwrxn7j6zjc.webp', '120-wottagirl-secret-chrush-amber-kiss-body-splash-long-lasting-original-imahgfydyekfz2zr.webp', '135-bold-long-lasting-body-mist-for-women-dermatologically-original-imahe5fru8sajp9x.webp', '150-french-kiss-body-mist-with-warm-vanilla-starfruit-long-original-imagrddsrvczywhm.webp'],
  },
  trimmers: {
    title: 'Beauty Trimmers',
    description: 'Trimmer',
    brands: ['Beardo', 'Philips', 'Vega', 'Nova'],
    imageDir: '/dedorant/trimmers',
    files: ['-original-imahk54azcw9yfcw.webp', '-original-imahmp6dshggc2pt.webp', '40299125_3-beardo-don-trimmer-for-men-15-hour-runtime-2-hour-quick-charge-20-length-settings-0-10-mm-black.webp', '41LBFe+PCyL.jpg', 'Beardo_Apex_Trimmer_A__Banner_2160x2160_03.avif', 'trimmer-with-nozzles_150455-4005.avif'],
  },
  'hair-dryer': {
    title: 'Beauty Hair Dryer',
    description: 'Hair Dryer',
    brands: ['Havells', 'Philips', 'Vega', 'Impex'],
    imageDir: '/dedorant/hairdryer',
    files: ['10154869HD-1300.webp', '61SBB6-s4vL._SL1500_-1200x1200.jpg', 'havells-hd-3104-hair-dryers-sky-blue-108173455-6o218.avif', 'hd-1835-hav-hd-1835-havells-original-imahj4bufsyysukh.webp', 'impex-hair-dryer-09-07-2021-9-239451611-xqgfn.webp'],
  },
};

const groups = {
  makeup: { title: 'Beauty Makeup', slugs: ['lipstick', 'lip-liner', 'mascara', 'eyeliner'] },
  haircare: { title: 'Beauty Haircare', slugs: ['shampoo', 'hair-oil', 'hair-gel', 'hair-color', 'hair-serum'] },
  fragrances: { title: 'Beauty Fragrances', slugs: ['perfume', 'deodorant', 'body-mist'] },
  appliances: { title: 'Beauty Appliances', slugs: ['hair-dryer'] },
  "men's-grooming": { title: "Beauty Men's Grooming", slugs: ['trimmers', 'hair-oil', 'hair-wax'] },
  'mens-grooming': { title: "Beauty Men's Grooming", slugs: ['trimmers', 'hair-oil', 'hair-wax'] },
  'baby-care': { title: 'Beauty Baby Care', slugs: ['baby-care'] },
  masks: { title: 'Beauty Masks', slugs: ['masks'] },
  'skincare-bath-body': { title: 'Beauty Skincare, Bath & Body', slugs: ['body-mist', 'deodorant'] },
};

const aliases = {
  'lip-gloss': 'lipstick',
  kajal: 'eyeliner',
  conditioner: 'shampoo',
  'hair-cream': 'hair-gel',
  'hair-accessory': 'hair-serum',
  'hair-straightener': 'hair-dryer',
  epilator: 'hair-dryer',
  'beard-oil': 'hair-oil',
  'face-moisturiser': 'body-mist',
  cleanser: 'body-mist',
  'masks-peel': 'masks',
};

export default function BeautySectionPage() {
  const params = useParams();
  const section = params.section as string;

  return (
    <ProductListingPage
      config={buildCatalogConfig({
        section,
        accentColor: '#14b8a6',
        defaultSlug: 'lipstick',
        fallbackTitle: 'Beauty',
        imageDir: '/body mist/lipstick',
        catalog,
        groups,
        aliases,
        commonFilters,
        stripPrefix: /^Beauty\s/,
      })}
    />
  );
}
