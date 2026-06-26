import fs from 'node:fs/promises';
import path from 'node:path';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5285';
const publicDir = path.resolve(process.cwd(), 'public');
const imageExtensions = new Set(['.avif', '.jpg', '.jpeg', '.png', '.webp']);

const roots = [
  { dir: 'men section', department: 'men' },
  { dir: 'Women section', department: 'women' },
  { dir: 'kids section', department: 'kids' },
  { dir: 'genz section', department: 'genz' },
  { dir: 'Home', department: 'home' },
  { dir: 'body mist', department: 'beauty' },
  { dir: 'dedorant', department: 'beauty' },
];

const brandHints = [
  ['all_saints', 'All Saints'],
  ['armani', 'Armani'],
  ['asics', 'ASICS'],
  ['baggit', 'Baggit'],
  ['bata', 'Bata'],
  ['beardo', 'Beardo'],
  ['boss', 'BOSS'],
  ['calvin', 'Calvin Klein'],
  ['casio', 'Casio'],
  ['columbia', 'Columbia'],
  ['diesel', 'Diesel'],
  ['fossil', 'Fossil'],
  ['havells', 'Havells'],
  ['lakme', 'Lakme'],
  ['levis', 'Levis'],
  ['maybelline', 'Maybelline'],
  ['nivea', 'Nivea'],
  ['nike', 'Nike'],
  ['onitsuka', 'Onitsuka Tiger'],
  ['puma', 'Puma'],
  ['ray-ban', 'Ray-Ban'],
  ['tresemme', 'TRESemme'],
  ['van heusen', 'Van Heusen'],
  ['wild stone', 'Wild Stone'],
];

function encodePublicPath(relativePath) {
  return `/${relativePath.split(path.sep).map(encodeURIComponent).join('/')}`;
}

function titleCase(value) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanName(fileName) {
  const withoutExt = fileName.replace(/\.[^.]+$/, '');
  const withoutNoise = withoutExt
    .replace(/original/im, '')
    .replace(/sdl\d+/im, '')
    .replace(/imah[a-z0-9]+/gim, '')
    .replace(/\d+x\d+/g, '')
    .replace(/\d+/g, ' ')
    .replace(/[()+]/g, ' ');

  const name = titleCase(withoutNoise);
  return name.length >= 4 ? name : titleCase(withoutExt);
}

function categoryFromPath(root, relativePath) {
  const parts = relativePath.split(path.sep);
  if (parts.length > 2) return titleCase(parts[1]);

  const file = parts.at(-1)?.toLowerCase() || '';
  if (/shirt|t-shirt|tshirt|top|jacket|coat|blazer|kurta|sherwani|vest|thermal/.test(file)) return 'topwear';
  if (/jeans|trouser|short|track|jogger|palazzo|legging|skirt/.test(file)) return 'bottomwear';
  if (/shoe|sneaker|sandal|flat|flip|sock/.test(file)) return 'footwear';
  if (/wallet|belt|watch|sunglass|bag|handbag|jewel|cap|clutch/.test(file)) return 'accessories';
  if (/lip|mascara|eye|hair|perfume|mist|deodorant|trimmer|mask|shampoo|gel|wax|serum/.test(file)) return 'beauty';
  if (/bed|bath|lamp|decor|cup|mug|kitchen|towel|mat|carpet/.test(file)) return 'home';
  return root.department;
}

function brandFromName(name) {
  const normalized = name.toLowerCase();
  const match = brandHints.find(([hint]) => normalized.includes(hint));
  return match?.[1] || 'Shopore';
}

function priceForIndex(index, department) {
  const baseByDepartment = {
    beauty: 299,
    home: 499,
    kids: 399,
    genz: 499,
    women: 699,
    men: 699,
  };
  return (baseByDepartment[department] || 599) + (index % 8) * 100;
}

async function listImages(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listImages(fullPath));
      continue;
    }

    if (imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function createProduct(product) {
  const response = await fetch(`${apiUrl}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return response.json();
}

let created = 0;
let skipped = 0;

async function getExistingImages() {
  const response = await fetch(`${apiUrl}/api/products`);
  if (!response.ok) return new Set();

  const products = await response.json();
  if (!Array.isArray(products)) return new Set();

  return new Set(products.flatMap((product) => [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
  ]).filter(Boolean));
}

const existingImages = await getExistingImages();

for (const root of roots) {
  const rootPath = path.join(publicDir, root.dir);

  try {
    await fs.access(rootPath);
  } catch {
    continue;
  }

  const images = await listImages(rootPath);

  for (const [index, fullPath] of images.entries()) {
    const relativePath = path.relative(publicDir, fullPath);
    const image = encodePublicPath(relativePath);
    if (existingImages.has(image)) {
      skipped++;
      continue;
    }

    const name = cleanName(path.basename(fullPath));
    const category = categoryFromPath(root, relativePath);
    const price = priceForIndex(index, root.department);

    await createProduct({
      name,
      brand: brandFromName(name),
      category: root.department,
      subCategory: category,
      description: category,
      image,
      images: [image],
      price,
      originalPrice: price + Math.round(price * 0.4),
      stockQuantity: 25,
    });

    created++;
    existingImages.add(image);
  }
}

console.log(`Seeded ${created} products from public images into ${apiUrl}. Skipped ${skipped} existing images.`);
