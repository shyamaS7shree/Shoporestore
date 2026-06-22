export type WishlistProduct = {
  id: string;
  brand: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  department?: string;
  category?: string;
  subCategory?: string;
  size?: string;
  color?: string;
  fit?: string;
  href?: string;
};

const WISHLIST_KEY = 'shopore-wishlist';
const WISHLIST_EVENT = 'shopore-wishlist-updated';

function emitWishlistUpdate() {
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

export function getWishlistEventName() {
  return WISHLIST_EVENT;
}

export function readWishlist(): WishlistProduct[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawWishlist = window.localStorage.getItem(WISHLIST_KEY);
    return rawWishlist ? JSON.parse(rawWishlist) : [];
  } catch {
    return [];
  }
}

export function writeWishlist(items: WishlistProduct[]) {
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  emitWishlistUpdate();
}

export function isInWishlist(id: string) {
  return readWishlist().some((item) => item.id === id);
}

export function addToWishlist(product: WishlistProduct) {
  const items = readWishlist();
  const existing = items.find((item) => item.id === product.id);

  if (existing) {
    writeWishlist(items.map((item) => (item.id === product.id ? { ...item, ...product } : item)));
    return items;
  }

  const nextItems = [product, ...items];
  writeWishlist(nextItems);
  return nextItems;
}

export function removeFromWishlist(id: string) {
  const nextItems = readWishlist().filter((item) => item.id !== id);
  writeWishlist(nextItems);
  return nextItems;
}

export function toggleWishlist(product: WishlistProduct) {
  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id);
    return false;
  }

  addToWishlist(product);
  return true;
}
