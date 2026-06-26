import { apiFetch, getUser } from '@/lib/api';

export type WishlistProduct = {
  id: string;
  product_id?: string;
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

function getLoggedInUserId() {
  if (typeof window === 'undefined') return null;

  const user = getUser();
  const id = Number(user?.id || user?.user_id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function getProductId(id: string | number | undefined) {
  const value = String(id || '');
  const match = value.match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function normalizeWishlistProduct(item: any): WishlistProduct {
  const productId = String(item.product_id || getProductId(item.id));
  return {
    id: item.id || `${item.department || 'shop'}-${productId}`,
    product_id: productId,
    brand: item.brand || 'Shopore',
    name: item.name || 'Product',
    image: item.image || '',
    price: Number(item.price || 0),
    originalPrice: item.originalPrice == null ? undefined : Number(item.originalPrice),
    discount: item.discount,
    department: item.department,
    category: item.category,
    subCategory: item.subCategory,
    size: item.size,
    color: item.color,
    fit: item.fit,
    href: item.href || `/products/${productId}`,
  };
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

export async function refreshWishlist() {
  const userId = getLoggedInUserId();
  if (!userId) return readWishlist();

  const response = await apiFetch(`/api/wishlist?user_id=${encodeURIComponent(userId)}`);
  if (!response.ok) return readWishlist();

  const data = await response.json();
  const items = Array.isArray(data) ? data.map(normalizeWishlistProduct) : [];
  writeWishlist(items);
  return items;
}

export function isInWishlist(id: string) {
  return readWishlist().some((item) => item.id === id);
}

export async function addToWishlist(product: WishlistProduct) {
  const items = readWishlist();
  const existing = items.find((item) => item.id === product.id);

  if (existing) {
    const nextItems = items.map((item) => (item.id === product.id ? { ...item, ...product } : item));
    writeWishlist(nextItems);
    return nextItems;
  }

  const nextItems = [product, ...items];
  writeWishlist(nextItems);

  const userId = getLoggedInUserId();
  const productId = getProductId(product.product_id || product.id);
  if (userId && productId) {
    const response = await apiFetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, product_id: productId }),
    });

    if (response.ok) {
      await refreshWishlist();
    } else {
      writeWishlist(items);
      let message = 'Product is not available in the database.';
      try {
        const data = await response.json();
        message = data.error || data.message || message;
      } catch {
        // Keep the default message.
      }
      throw new Error(message);
    }
  }

  return nextItems;
}

export async function removeFromWishlist(id: string) {
  const nextItems = readWishlist().filter((item) => item.id !== id);
  writeWishlist(nextItems);

  const userId = getLoggedInUserId();
  const productId = getProductId(id);
  if (userId && productId) {
    await apiFetch(`/api/wishlist?user_id=${encodeURIComponent(userId)}&product_id=${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
  }

  return nextItems;
}

export async function toggleWishlist(product: WishlistProduct) {
  if (isInWishlist(product.id)) {
    await removeFromWishlist(product.id);
    return false;
  }

  await addToWishlist(product);
  return true;
}
