'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  X,
  AlertCircle,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Heart,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Share2,
  Undo2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { getProductById } from '@/lib/products';
import { addToCart, getCartItemKey, removeCartItem, updateCartQuantity } from '@/lib/cart';
import { saveDeliveryLocation } from '@/lib/deliveryLocation';
import { getWishlistEventName, isInWishlist, toggleWishlist } from '@/lib/wishlist';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getProductType(product: DetailProduct) {
  return product.subCategory || product.category || product.description || 'Product';
}

function getDepartment(product: DetailProduct) {
  if (product.department) return product.department;

  const joined = `${product.category || ''} ${product.subCategory || ''} ${product.image || ''}`.toLowerCase();
  if (joined.includes('women')) return 'women';
  if (joined.includes('kids') || joined.includes('boys') || joined.includes('girls')) return 'kids';
  if (joined.includes('home')) return 'home';
  if (joined.includes('beauty') || joined.includes('body mist') || joined.includes('dedorant')) return 'beauty';
  if (joined.includes('genz')) return 'genz';
  return 'men';
}

function getGenderLabel(product: DetailProduct) {
  const department = getDepartment(product);
  const joined = `${product.category || ''} ${product.subCategory || ''} ${product.name || ''}`.toLowerCase();

  if (department === 'women' || joined.includes('women')) return 'Women';
  if (department === 'kids') return joined.includes('girl') ? 'Girls' : joined.includes('boy') ? 'Boys' : 'Kids';
  if (department === 'home') return 'Home';
  if (department === 'beauty') return joined.includes('men') ? 'Men' : 'Unisex';
  if (department === 'genz') {
    if (joined.includes('women')) return 'Women';
    if (joined.includes('men')) return 'Men';
    return 'Unisex';
  }
  return 'Men';
}

function slugify(value?: string) {
  return (value || 'topwear')
    .toLowerCase()
    .replace(/\s+&\s+/g, '-')
    .replace(/[\s,]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildProductHref(product: DetailProduct, selectedSize?: string) {
  const params = new URLSearchParams({
    department: getDepartment(product),
    brand: product.brand,
    name: product.name,
    description: product.description,
    image: product.image,
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    category: product.category || '',
    subCategory: product.subCategory || '',
    size: selectedSize || product.size || '',
    color: product.color || '',
    fit: product.fit || '',
  });

  return `/products/${encodeURIComponent(product.id)}?${params.toString()}`;
}

function isClothingProduct(product: DetailProduct) {
  const productType = getProductType(product).toLowerCase();
  const department = getDepartment(product);

  if (department === 'beauty') return false;
  if (
    /shoe|sneaker|footwear|sandal|flipflop|flip flop|boot|flat|heel|ballerina|sock|slipper/.test(productType)
  ) {
    return false;
  }

  if (
    /wallet|belt|perfume|mist|grooming|watch|sunglasses|frames|jewellery|handbag|bag|clutch|backpack|cap|skincare|haircare|bath|body|makeup|fragrance|appliance|dryer|trimmer|deodorant|mask|baby care/.test(productType)
  ) {
    return false;
  }

  return /shirt|t-shirt|tshirt|dress|top|jeans|trouser|short|jogger|pant|kurta|suit|saree|ethnic|legging|skirt|palazzo|dupatta|jacket|blazer|coat|bra|shapewear|sleepwear|loungewear|bodysuit|romper|brief|trunk|boxer|vest|thermal|sweater|sweatshirt|plus size/.test(productType);
}

function isFootwearProduct(product: DetailProduct) {
  const productType = getProductType(product).toLowerCase();

  return /shoe|sneaker|footwear|sandal|flipflop|flip flop|boot|flat|heel|ballerina|slipper/.test(productType);
}

function getAvailableSizes(product: DetailProduct, isClothing: boolean, isFootwear: boolean) {
  if (isClothing) return ['S', 'M', 'L', 'XL', '2XL'];
  if (!isFootwear) return [];

  const gender = getGenderLabel(product);
  if (gender === 'Women') return ['3', '4', '5', '6', '7', '8'];
  if (gender === 'Kids' || gender === 'Boys' || gender === 'Girls') return ['1C', '2C', '3C', '4C', '5C', '1Y', '2Y'];
  return ['6', '7', '8', '9', '10', '11'];
}

function buildHighlights(product: DetailProduct) {
  const productType = getProductType(product).replace(/^(Men|Women|Kids|Boys|Girls|GenZ|Beauty)\s/, '');
  const lowerType = productType.toLowerCase();
  const lowerName = product.name.toLowerCase();
  const color = product.color || 'As shown';
  const fit = product.fit || 'Regular Fit';
  const gender = getGenderLabel(product);

  if (/watch/.test(lowerType)) {
    return [
      ['Dial Shape', 'Round'],
      ['Display', 'Analog'],
      ['Gender', gender],
      ['Product Type', productType],
      ['Strap Material', /leather/.test(lowerName) ? 'Leather' : 'Stainless Steel'],
      ['Water Resistance', 'Splash Resistant'],
      ['Movement', /chronograph/.test(lowerName) ? 'Chronograph' : 'Quartz'],
      ['Care Instructions', 'Wipe with dry cloth'],
    ];
  }

  if (/perfume|mist|body spray|grooming|personal care/.test(lowerType)) {
    return [
      ['Fragrance Type', /mist|spray/.test(lowerName) ? 'Body Spray' : 'Eau De Parfum'],
      ['Pack Of', '1'],
      ['Gender', gender],
      ['Product Type', productType],
      ['Fragrance Family', /wild|code|bold|shot/i.test(product.name) ? 'Woody Spicy' : 'Fresh'],
      ['Volume', /150/.test(product.name) ? '150 ml' : '50 ml'],
      ['Usage', 'Daily Grooming'],
      ['Care Instructions', 'Store in a cool dry place'],
    ];
  }

  if (/wallet/.test(lowerType)) {
    return [
      ['Material', 'Leather'],
      ['Pattern', 'Textured'],
      ['Gender', gender],
      ['Product Type', productType],
      ['Card Slots', 'Multiple'],
      ['Closure Type', 'Fold'],
      ['Color', color],
      ['Care Instructions', 'Wipe with dry cloth'],
    ];
  }

  if (/belt/.test(lowerType)) {
    return [
      ['Material', 'Leather'],
      ['Pattern', 'Solid'],
      ['Gender', gender],
      ['Product Type', productType],
      ['Buckle Type', 'Pin Buckle'],
      ['Occasion', /formal/i.test(product.name) ? 'Formal Wear' : 'Casual Wear'],
      ['Color', color],
      ['Care Instructions', 'Wipe with dry cloth'],
    ];
  }

  if (/sunglasses|frames/.test(lowerType)) {
    return [
      ['Frame Shape', /aviator/i.test(product.name) ? 'Aviator' : 'Square'],
      ['Lens Feature', 'UV Protected'],
      ['Gender', gender],
      ['Product Type', productType],
      ['Frame Material', 'Metal / Acetate'],
      ['Occasion', 'Outdoor Wear'],
      ['Color', color],
      ['Care Instructions', 'Clean with lens cloth'],
    ];
  }

  if (/shoe|sneaker/.test(lowerType)) {
    return [
      ['Sole Material', 'Rubber'],
      ['Closure Type', /slip/i.test(product.name) ? 'Slip-On' : 'Lace-Up'],
      ['Gender', gender],
      ['Product Type', productType],
      ['Occasion', /formal/i.test(lowerType) ? 'Formal Wear' : 'Casual Wear'],
      ['Upper Material', /formal|leather/i.test(product.name) ? 'Leather' : 'Synthetic'],
      ['Color', color],
      ['Care Instructions', 'Wipe with clean cloth'],
    ];
  }

  if (/jacket|blazer|coat|sherwani|nehru/.test(lowerType)) {
    return [
      ['Pattern', /printed|embroidered/i.test(product.name) ? 'Printed' : 'Solid'],
      ['Closure Type', /jacket|coat/i.test(lowerType) ? 'Zip / Button' : 'Button'],
      ['Gender', gender],
      ['Product Type', productType],
      ['Occasion', /sherwani|nehru|blazer|coat/i.test(lowerType) ? 'Festive / Formal Wear' : 'Casual Wear'],
      ['Fabric', /sherwani|nehru/i.test(lowerType) ? 'Jacquard Blend' : 'Polyester Blend'],
      ['Fit', fit],
      ['Care Instructions', 'Dry Clean Preferred'],
    ];
  }

  if (/brief|trunk|boxer|vest|thermal/.test(lowerType)) {
    return [
      ['Pattern', /printed/i.test(product.name) ? 'Printed' : 'Solid'],
      ['Pack Of', /pack/i.test(lowerName) ? 'Pack' : '1'],
      ['Gender', gender],
      ['Product Type', productType],
      ['Fabric', 'Cotton Stretch'],
      ['Waist Rise', 'Mid Rise'],
      ['Fit', fit],
      ['Care Instructions', 'Machine Wash'],
    ];
  }

  return [
    ['Pattern', /printed|typographic/i.test(product.name) ? 'Typographic' : 'Solid'],
    ['Pack Of', '1'],
    ['Gender', gender],
    ['Product Type', productType],
    ['Occasion', /formal/i.test(lowerType) ? 'Formal Wear' : 'Casual Wear'],
    ['Fabric', /jeans/i.test(lowerType) ? 'Denim' : 'Cotton Blend'],
    ['Fit', fit],
    ['Care Instructions', 'Machine Wash'],
  ];
}

type DetailProduct = {
  id: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  department?: string;
  category?: string;
  subCategory?: string;
  image: string;
  size?: string;
  color?: string;
  fit?: string;
};

type PinLookupResult = {
  pin: string;
  name: string;
  district: string;
  state: string;
  country: string;
  deliveryStatus: string;
};

export default function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const query = React.use(searchParams || Promise.resolve({}));
  const fallbackProduct = getProductById(id);

  const product = useMemo<DetailProduct | null>(() => {
    const queryName = getParam(query, 'name');
    const queryImage = getParam(query, 'image');

    if (queryName && queryImage) {
      return {
        id,
        brand: getParam(query, 'brand') || getParam(query, 'category') || 'Shopore',
        name: queryName,
        description: getParam(query, 'description') || queryName,
        image: queryImage,
        price: Number(getParam(query, 'price') || 0),
        originalPrice: Number(getParam(query, 'originalPrice') || 0) || undefined,
        department: getParam(query, 'department'),
        category: getParam(query, 'category'),
        subCategory: getParam(query, 'subCategory'),
        size: getParam(query, 'size'),
        color: getParam(query, 'color'),
        fit: getParam(query, 'fit'),
      };
    }

    if (!fallbackProduct) return null;

    return {
      id: fallbackProduct.id,
      brand: fallbackProduct.brand || fallbackProduct.category,
      name: fallbackProduct.name,
      description: fallbackProduct.description,
      price: fallbackProduct.price,
      originalPrice: fallbackProduct.originalPrice,
      category: fallbackProduct.category,
      image: fallbackProduct.image,
    };
  }, [fallbackProduct, id, query]);

  const [selectedSize, setSelectedSize] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);
  const [isAddingToBag, setIsAddingToBag] = useState(false);
  const [bagQuantity, setBagQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinResult, setPinResult] = useState<PinLookupResult | null>(null);
  const [pinError, setPinError] = useState('');

  const wishlistId = product ? `${getDepartment(product)}-${product.id}` : '';

  React.useEffect(() => {
    if (!wishlistId) return;

    const syncWishlistState = () => setIsWishlisted(isInWishlist(wishlistId));
    syncWishlistState();
    window.addEventListener(getWishlistEventName(), syncWishlistState);
    window.addEventListener('storage', syncWishlistState);

    return () => {
      window.removeEventListener(getWishlistEventName(), syncWishlistState);
      window.removeEventListener('storage', syncWishlistState);
    };
  }, [wishlistId]);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="mb-4 text-[26px] font-semibold text-[#071225]">
            Product not found
          </h1>
          <Link href="/men/topwear" className="text-[14px] font-semibold text-blue-700">
            Back to Shopping
          </Link>
        </div>
      </div>
    );
  }

  const productType = getProductType(product).replace(/^(Men|Women|Kids|Boys|Girls|GenZ|Beauty)\s/, '');
  const isClothing = isClothingProduct(product);
  const isFootwear = isFootwearProduct(product);
  const hasSizeSelection = isClothing || isFootwear;
  const sizes = getAvailableSizes(product, isClothing, isFootwear);
  const highlights = buildHighlights(product);

  const visibleHighlights = showMore ? highlights : highlights.slice(0, 4);
  const exploreHref = `/${getDepartment(product)}/${slugify(product.subCategory || product.category)}`;
  const cartProduct = {
    id: product.id,
    brand: product.brand,
    name: product.name,
    image: product.image,
    price: product.price,
    originalPrice: product.originalPrice,
    color: product.color,
    size: hasSizeSelection ? selectedSize : undefined,
    href: buildProductHref(product, hasSizeSelection ? selectedSize : product.size),
  };
  const wishlistProduct = {
    id: wishlistId,
    brand: product.brand,
    name: product.name,
    image: product.image,
    price: product.price,
    originalPrice: product.originalPrice,
    department: getDepartment(product),
    category: product.category,
    subCategory: product.subCategory,
    size: product.size,
    color: product.color,
    fit: product.fit,
    href: buildProductHref(product, product.size),
  };

  const handleAddToBag = () => {
    if (hasSizeSelection && !selectedSize) {
      toast.error('Please select size');
      return;
    }

    setIsAddingToBag(true);
    window.setTimeout(() => {
      addToCart(cartProduct, bagQuantity);
      setAddedToBag(true);
      setIsAddingToBag(false);
      toast.success(`${product.name} added to bag`);
    }, 500);
  };
  const handleShare = async () => {
    const shareData = {
      title: `${product.brand} - ${product.name}`,
      text: `Check out this product: ${product.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled or error
      }
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };
  const updateBagQuantity = (quantity: number) => {
    if (quantity < 1) {
      const shouldDelete = window.confirm('Do you really want to remove this product from your bag?');

      if (!shouldDelete) return;

      removeCartItem(getCartItemKey(cartProduct));
      setAddedToBag(false);
      setBagQuantity(1);
      toast.success('Product removed from bag');
      return;
    }

    const nextQuantity = Math.max(1, quantity);
    setBagQuantity(nextQuantity);

    if (addedToBag) {
      updateCartQuantity(getCartItemKey(cartProduct), nextQuantity);
    }
  };
  const checkPinCode = async () => {
    const cleanPin = pinCode.replace(/\D/g, '').slice(0, 6);
    setPinCode(cleanPin);
    setPinResult(null);
    setPinError('');

    if (cleanPin.length !== 6) {
      setPinError('Please enter a valid 6 digit PIN code.');
      return;
    }

    setPinLoading(true);

    try {
      const response = await apiFetch(`/api/pincode/${cleanPin}`);
      const data = await response.json();

      if (!response.ok) {
        setPinError(data.error || 'No delivery location found for this PIN code.');
        return;
      }

      setPinResult(data);
      saveDeliveryLocation(data);
      toast.success(`Delivery available for ${data.district}, ${data.state}`);
    } catch {
      setPinError('PIN lookup failed. Please try again.');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 pb-10 pt-[96px] font-['DM_Sans',Inter,sans-serif] text-[#071225] md:px-12">
      <div className="mx-auto mb-5 flex w-full max-w-[1500px] justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-[14px] font-semibold text-[#071225] transition hover:border-[#071225]"
        >
          <ArrowLeft size={17} />
          Back
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-10 2xl:grid-cols-[minmax(420px,520px)_minmax(0,1fr)] xl:grid-cols-[minmax(400px,500px)_minmax(0,1fr)]">
        <section className="lg:self-stretch">
          <div className="lg:sticky lg:top-[96px]">
            <div className="relative mx-auto aspect-[4/5] max-h-[560px] w-full max-w-[460px] overflow-hidden bg-white">
              <Image
                src={product.image}
                alt={`${product.brand} ${product.name}`}
                fill
                priority
                className="object-contain p-8 sm:p-10"
                sizes="(max-width: 768px) 86vw, (max-width: 1280px) 460px, 460px"
              />
            </div>
          </div>
        </section>

        <section className="w-full pt-1">
          <div className="mb-4 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-[25px] font-semibold uppercase leading-tight tracking-[0] text-[#071225]">
                {product.brand}
              </h1>
              <p className="mt-2 text-[16px] font-normal text-slate-500">
                {product.name}
              </p>
            </div>

            <div className="flex items-center gap-5 pt-1 text-[#071225]">
              <button
                type="button"
                aria-label="Share product"
                onClick={handleShare}
                className="transition hover:text-pink-500"
              >
                <Share2 size={19} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                aria-label="Wishlist product"
                onClick={() => {
                  const added = toggleWishlist(wishlistProduct);
                  setIsWishlisted(added);
                  toast.success(added ? 'Added to your Wishlist' : 'Removed from Wishlist');
                }}
                className="transition hover:text-pink-500"
              >
                <Heart
                  size={20}
                  strokeWidth={1.8}
                  className={isWishlisted ? 'fill-pink-500 text-pink-500' : ''}
                />
              </button>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-[25px] font-bold leading-none text-black">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              {product.originalPrice && (
                <p className="text-[14px] text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <p className="mt-2 text-[12px] text-slate-500">Inclusive of all taxes</p>
          </div>

          {hasSizeSelection && (
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold uppercase tracking-[0] text-[#071225]">
                  Size
                </h2>
                {isClothing && (
                  <button
                    type="button"
                    onClick={() => setShowSizeChart(true)}
                    className="flex items-center gap-1 text-[14px] font-semibold text-black"
                  >
                    Size Guide <ChevronRight size={16} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-start gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`h-9 w-11 border text-[13px] transition ${selectedSize === size
                      ? 'border-[#071225] bg-[#071225] text-white'
                      : 'border-slate-300 bg-white text-[#071225] hover:border-[#071225]'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
            {addedToBag && (
              <div className="flex h-12 border border-[#071225]">
                <button
                  type="button"
                  onClick={() => updateBagQuantity(bagQuantity - 1)}
                  className="flex w-12 items-center justify-center bg-slate-50 text-[#071225]"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="flex flex-1 items-center justify-center text-[15px] font-semibold">
                  {bagQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateBagQuantity(bagQuantity + 1)}
                  className="flex w-12 items-center justify-center bg-slate-50 text-[#071225]"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            {addedToBag ? (
              <Link
                href="/cart"
                className="flex h-12 items-center justify-center bg-[#1f1b1f] text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#111d31]"
              >
                Go To Bag
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={isAddingToBag}
                className="relative h-12 bg-[#071225] text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#111d31] disabled:opacity-80 sm:col-span-2"
              >
                {isAddingToBag ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
                  </span>
                ) : (
                  'Add To Bag'
                )}
              </button>
            )}
          </div>

          <section className="mb-7">
            <h2 className="mb-4 text-[20px] font-semibold uppercase tracking-[0]">
              Delivery Details
            </h2>
            <div className="flex h-[46px] w-full border border-slate-400">
              <input
                type="text"
                value={pinCode}
                onChange={(event) => {
                  setPinCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                  setPinResult(null);
                  setPinError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    checkPinCode();
                  }
                }}
                placeholder="Enter your PIN code"
                inputMode="numeric"
                maxLength={6}
                className="min-w-0 flex-1 px-4 text-[14px] text-[#071225] outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={checkPinCode}
                disabled={pinLoading}
                className="flex min-w-[88px] items-center justify-center px-5 text-[14px] font-semibold text-[#071225] disabled:opacity-60"
              >
                {pinLoading ? <Loader2 size={17} className="animate-spin" /> : 'CHECK'}
              </button>
            </div>

            {pinResult && (
              <div className="mt-3 flex w-full items-start gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Delivery available to {pinResult.pin}</p>
                  <p className="mt-0.5">
                    {pinResult.name ? `${pinResult.name}, ` : ''}
                    {pinResult.district}, {pinResult.state}, {pinResult.country}
                    {pinResult.deliveryStatus ? ` · ${pinResult.deliveryStatus}` : ''}
                  </p>
                </div>
              </div>
            )}

            {pinError && (
              <div className="mt-3 flex w-full items-center gap-2 border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">
                <AlertCircle size={16} />
                <span>{pinError}</span>
              </div>
            )}

            <div className="mt-3 flex items-center gap-3 text-[15px] text-[#071225]">
              <RotateCcw size={18} className="text-slate-500" />
              <span>14 Days Easy Returns And Exchange</span>
            </div>
          </section>

          <section className="mb-8 grid grid-cols-3 border-y border-slate-200 py-5">
            {[
              [BadgeCheck, '100% Authentic'],
              [Package, 'Fast Delivery'],
              [Undo2, 'Easy Return'],
            ].map(([Icon, label], index) => {
              const ServiceIcon = Icon as typeof BadgeCheck;
              return (
                <div
                  key={label as string}
                  className={`text-center ${index !== 2 ? 'border-r border-slate-200' : ''}`}
                >
                  <ServiceIcon className="mx-auto mb-2 text-black" size={27} />
                  <p className="text-[13px] text-[#071225]">{label as string}</p>
                </div>
              );
            })}
          </section>

          <section className="border-t border-slate-200 pt-7">
            <button
              type="button"
              onClick={() => setShowMore((value) => !value)}
              className="mb-6 flex w-full items-center justify-between text-left"
            >
              <h2 className="text-[23px] font-semibold uppercase tracking-[0] text-black">
                Product Highlights
              </h2>
              {showMore ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>

            <div className="grid grid-cols-1 gap-x-24 gap-y-5 text-[14px] sm:grid-cols-2">
              {visibleHighlights.map(([label, value]) => (
                <div key={label}>
                  <p className="text-slate-500">{label}:</p>
                  <p className="mt-1 font-semibold text-black">{value}</p>
                </div>
              ))}
            </div>

            {!showMore && (
              <button
                type="button"
                onClick={() => setShowMore(true)}
                className="mt-7 flex items-center gap-1 text-[14px] font-semibold text-blue-700"
              >
                View More <ChevronDown size={15} />
              </button>
            )}

            <Link
              href={exploreHref}
              className="mt-8 flex items-center justify-between border border-slate-200 px-4 py-3 transition hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-11 overflow-hidden bg-slate-100">
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="44px" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#071225]">{product.brand}</p>
                  <p className="mt-1 text-[13px] text-slate-500">Explore All Products</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </Link>
          </section>
        </section>
      </div>
      {showSizeChart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowSizeChart(false)}
        >
          <div
            className="relative w-full max-w-[600px] bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold uppercase text-[#071225]">Size Chart</h2>
              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="text-slate-400 hover:text-black"
              >
                <X size={22} />
              </button>
            </div>

            {/* How to measure */}
            <p className="mb-4 text-[13px] text-slate-500">
              All measurements are in <strong>inches</strong>. Measure your body and compare with the chart below.
            </p>

            {/* Size Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#071225] text-white">
                    <th className="border border-slate-300 px-4 py-2 text-left">Size</th>
                    <th className="border border-slate-300 px-4 py-2">Chest (in)</th>
                    <th className="border border-slate-300 px-4 py-2">Waist (in)</th>
                    <th className="border border-slate-300 px-4 py-2">Hip (in)</th>
                    <th className="border border-slate-300 px-4 py-2">Height (ft)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['S', '34–36', '28–30', '34–36', "5'3\"–5'6\""],
                    ['M', '38–40', '32–34', '38–40', "5'6\"–5'8\""],
                    ['L', '42–44', '36–38', '42–44', "5'8\"–5'10\""],
                    ['XL', '46–48', '40–42', '46–48', "5'10\"–6'0\""],
                    ['2XL', '50–52', '44–46', '50–52', "6'0\"–6'2\""],
                  ].map(([size, chest, waist, hip, height], i) => (
                    <tr key={size} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-200 px-4 py-2 font-semibold text-[#071225]">{size}</td>
                      <td className="border border-slate-200 px-4 py-2 text-center">{chest}</td>
                      <td className="border border-slate-200 px-4 py-2 text-center">{waist}</td>
                      <td className="border border-slate-200 px-4 py-2 text-center">{hip}</td>
                      <td className="border border-slate-200 px-4 py-2 text-center">{height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tip */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-[12px] text-slate-500">
                💡 <strong>Tip:</strong> If you are between sizes, we recommend going one size up for a comfortable fit.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
