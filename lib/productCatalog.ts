import type { CategoryConfig, FilterSection, Product } from '@/components/ProductListingPage';
import { getCatalogDiscount, getCatalogOriginalPrice, getCatalogPrice } from '@/lib/pricing';

type CatalogItem = {
  title: string;
  description: string;
  brands: string[];
  files: string[];
  imageDir?: string;
  names?: string[];
  sizes?: string[];
  colors?: string[];
  fits?: string[];
};

type CatalogGroup = {
  title: string;
  slugs: string[];
};

type CatalogBuildOptions = {
  section: string;
  accentColor: string;
  defaultSlug: string;
  fallbackTitle: string;
  imageDir: string;
  catalog: Record<string, CatalogItem>;
  groups: Record<string, CatalogGroup>;
  aliases?: Record<string, string>;
  commonFilters: FilterSection[];
  stripPrefix?: RegExp;
};

const defaultSizedKeywords = [
  't-shirt',
  'tshirt',
  'shirt',
  'top',
  'dress',
  'jeans',
  'trouser',
  'capri',
  'sweater',
  'sweatshirt',
  'jacket',
  'coat',
  'blazer',
  'waistcoat',
  'kurta',
  'suit',
  'saree',
  'ethnic wear',
  'legging',
  'skirt',
  'palazzo',
  'bra',
  'shapewear',
  'sleepwear',
  'loungewear',
  'night',
  'clothing',
  'bodysuit',
  'romper',
  'sleepsuit',
];

function shouldUseDefaultSizes(item: CatalogItem, category?: string) {
  const text = [item.title, item.description, category].join(' ').toLowerCase();
  return defaultSizedKeywords.some((keyword) => text.includes(keyword));
}

function encodeAssetPath(path: string) {
  return path
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(segment) : segment))
    .join('/');
}

function cleanTitle(title: string, stripPrefix?: RegExp) {
  return stripPrefix ? title.replace(stripPrefix, '') : title;
}

function nameFromFile(fileName: string) {
  const baseName = fileName
    .split('/')
    .pop()
    ?.replace(/\.[^.]+$/, '')
    .replace(/\d+$/g, '')
    .replace(/^[-_]+/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!baseName || baseName.length < 3) return undefined;
  return baseName.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function categoryForSlug(slug: string, groups: Record<string, CatalogGroup>, stripPrefix?: RegExp) {
  return Object.values(groups).find((group) => group.slugs.includes(slug))?.title.replace(stripPrefix || /^$/, '');
}

function makeProducts(
  slug: string,
  catalog: Record<string, CatalogItem>,
  groups: Record<string, CatalogGroup>,
  fallbackImageDir: string,
  stripPrefix: RegExp | undefined,
  defaultSizes: string[] | undefined,
  startId = 1,
): Product[] {
  const item = catalog[slug];
  if (!item) return [];

  const subCategory = cleanTitle(item.title, stripPrefix);
  const category = categoryForSlug(slug, groups, stripPrefix);
  const sizes = item.sizes || (defaultSizes && shouldUseDefaultSizes(item, category) ? defaultSizes : undefined);
  const colors = item.colors || ['Black', 'Blue', 'White', 'Pink', 'Green', 'Brown'];
  const fits = item.fits || ['Regular Fit', 'Relaxed Fit', 'Slim Fit', 'Oversized'];
  const names = item.names || [item.description];
  const dir = item.imageDir || fallbackImageDir;

  return item.files.map((file, index) => {
    const price = getCatalogPrice(slug, index);
    const originalPrice = getCatalogOriginalPrice(price, index);

    return {
      id: startId + index,
      brand: item.brands[index % item.brands.length],
      name: names[index % names.length] || nameFromFile(file) || item.description,
      description: item.description,
      category,
      subCategory,
      size: sizes?.[index % sizes.length],
      color: colors[index % colors.length],
      fit: fits[index % fits.length],
      price,
      originalPrice,
      discount: getCatalogDiscount(price, originalPrice),
      offer: index % 4 === 0 ? '1 Offer Available' : undefined,
      image: encodeAssetPath(`${dir}/${file}`),
    };
  });
}

export function buildCatalogConfig({
  section,
  accentColor,
  defaultSlug,
  fallbackTitle,
  imageDir,
  catalog,
  groups,
  aliases = {},
  commonFilters,
  stripPrefix,
}: CatalogBuildOptions): CategoryConfig {
  const slug = aliases[section] || section;
  const group = groups[slug];
  const productSlugs = group?.slugs || [slug];
  const commonSizeFilter = commonFilters.find((filter) => filter.label.toLowerCase() === 'size');
  const defaultSizes = commonSizeFilter?.options;
  const products = productSlugs.flatMap((itemSlug, groupIndex) =>
    makeProducts(itemSlug, catalog, groups, imageDir, stripPrefix, defaultSizes, groupIndex * 100 + 1),
  );
  const title = group?.title || catalog[slug]?.title || fallbackTitle;
  const fallbackProducts = makeProducts(defaultSlug, catalog, groups, imageDir, stripPrefix, defaultSizes);
  const finalProducts = products.length ? products : fallbackProducts;
  const brands = Array.from(new Set(finalProducts.map((product) => product.brand)));
  const sizeOptions = Array.from(
    new Set(finalProducts.map((product) => product.size).filter(Boolean)),
  ) as string[];
  const subCategoryOptions = productSlugs
    .map((itemSlug) => catalog[itemSlug]?.title && cleanTitle(catalog[itemSlug].title, stripPrefix))
    .filter(Boolean) as string[];
  const finalFilters = commonFilters
    .filter((filter) => filter.label.toLowerCase() !== 'size')
    .concat(sizeOptions.length ? [{ label: 'Size', options: sizeOptions }] : []);

  return {
    title,
    totalProducts: finalProducts.length,
    accentColor,
    brands: brands.slice(0, 8),
    filters: [
      { label: 'Sub-Categories', options: subCategoryOptions.length ? subCategoryOptions : [cleanTitle(title, stripPrefix)] },
      { label: 'Brands', options: brands },
      ...finalFilters,
    ],
    products: finalProducts,
  };
}
