'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';
import { addToCart } from '@/lib/cart';
import {
  getWishlistEventName,
  readWishlist,
  refreshWishlist,
  removeFromWishlist,
  WishlistProduct,
} from '@/lib/wishlist';

function formatPrice(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function getDiscount(item: WishlistProduct) {
  if (item.discount) return item.discount;
  if (!item.originalPrice || item.originalPrice <= item.price) return undefined;
  return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistProduct[]>([]);

  useEffect(() => {
    const syncWishlist = () => setItems(readWishlist());
    syncWishlist();
    refreshWishlist().then(setItems).catch(syncWishlist);
    window.addEventListener(getWishlistEventName(), syncWishlist);
    window.addEventListener('storage', syncWishlist);

    return () => {
      window.removeEventListener(getWishlistEventName(), syncWishlist);
      window.removeEventListener('storage', syncWishlist);
    };
  }, []);

  const removeItem = async (id: string) => {
    setItems(await removeFromWishlist(id));
    toast.success('Removed from Wishlist');
  };

  const moveToBag = async (item: WishlistProduct) => {
    addToCart({
      id: item.id,
      brand: item.brand,
      name: item.name,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      color: item.color,
      size: item.size,
      href: item.href,
    });
    setItems(await removeFromWishlist(item.id));
    toast.success('Moved to bag');
  };

  return (
    <main className="min-h-screen bg-white px-4 pb-16 pt-[112px] font-['DM_Sans',Inter,sans-serif] text-[#071225] md:px-12">
      <section className="mx-auto w-full max-w-[1680px]">
        <nav className="mb-7 flex items-center gap-2 text-[13px] text-slate-500">
          <Link href="/" className="hover:text-[#071225]">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#071225]">Wishlist</span>
        </nav>

        <h1 className="mb-8 text-[26px] font-semibold">
          {items.length} {items.length === 1 ? 'Product' : 'Products'} Wishlisted
        </h1>

        {items.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-pink-500">
              <Heart size={30} strokeWidth={1.8} />
            </div>
            <h2 className="text-[20px] font-bold">Your wishlist is empty</h2>
            <p className="mt-2 max-w-[340px] text-[13px] leading-6 text-slate-500">
              Tap the heart on products you like and they will show here.
            </p>
            <Link
              href="/men/topwear"
              className="mt-7 inline-flex h-11 items-center justify-center border border-[#071225] px-8 text-[13px] font-bold text-[#071225] transition hover:bg-[#071225] hover:text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
            {items.map((item) => {
              const discount = getDiscount(item);

              return (
                <article key={item.id} className="w-full">
                  <div className="relative aspect-[3/4.45] w-full overflow-hidden bg-[#f1f2f4]">
                    <Link href={item.href || `/products/${item.id}`}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={`${item.brand} ${item.name}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-5 text-center text-[13px] font-bold text-slate-500">
                          {item.brand}
                        </div>
                      )}
                    </Link>
                    <button
                      type="button"
                      aria-label="Remove from wishlist"
                      onClick={() => removeItem(item.id)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-[#071225]"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="px-2 pt-3">
                    <Link href={item.href || `/products/${item.id}`} className="block">
                      <p className="truncate text-[13px] text-slate-500">
                        <span className="font-bold text-[#071225]">{item.brand}</span> {item.name}
                      </p>
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                      <span className="font-bold text-[#071225]">{formatPrice(item.price)}</span>
                      {item.originalPrice && (
                        <span className="text-slate-400 line-through">{formatPrice(item.originalPrice)}</span>
                      )}
                      {discount && <span className="font-bold text-emerald-600">{discount}% Off</span>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => moveToBag(item)}
                    className="mt-11 flex h-11 w-full items-center justify-center gap-2 border border-[#071225] bg-white text-[13px] font-bold text-[#071225] transition hover:bg-[#071225] hover:text-white"
                  >
                    <ShoppingBag size={15} />
                    Move To Bag
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
