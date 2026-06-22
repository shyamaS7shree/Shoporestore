export type CartProduct = {
  id: string;
  brand: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  color?: string;
  size?: string;
  href?: string;
};

export type CartItem = {
  key: string;
  product: CartProduct;
  quantity: number;
};

const CART_KEY = 'shopore-cart';
const CART_EVENT = 'shopore-cart-updated';

function emitCartUpdate() {
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCartEventName() {
  return CART_EVENT;
}

export function getCartItemKey(product: Pick<CartProduct, 'id' | 'image' | 'size'>) {
  return [product.id, product.image, product.size || 'free-size'].join('|');
}

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawCart = window.localStorage.getItem(CART_KEY);
    return rawCart ? JSON.parse(rawCart) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  emitCartUpdate();
}

export function getCartCount() {
  return readCart().reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(product: CartProduct, quantity = 1) {
  const items = readCart();
  const key = getCartItemKey(product);
  const existing = items.find((item) => item.key === key);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ key, product, quantity });
  }

  writeCart(items);
  return items;
}

export function updateCartQuantity(key: string, quantity: number) {
  const items = readCart()
    .map((item) => (item.key === key ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  writeCart(items);
  return items;
}

export function removeCartItem(key: string) {
  const items = readCart().filter((item) => item.key !== key);
  writeCart(items);
  return items;
}
