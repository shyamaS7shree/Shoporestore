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
  Camera,
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
  Star,
  Undo2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, getUser } from '@/lib/api';
import { getProductById } from '@/lib/products';
import { addToCart, getCartItemKey, removeCartItem, updateCartQuantity } from '@/lib/cart';
import { saveDeliveryLocation } from '@/lib/deliveryLocation';
import { getWishlistEventName, isInWishlist, refreshWishlist, toggleWishlist } from '@/lib/wishlist';
import { getProductSizeOptions } from '@/lib/productSizing';

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
  rating?: number;
  reviews?: number;
  sizeOptions?: string[];
};

type ProductReview = {
  id: string;
  user_name: string;
  rating: number;
  title?: string;
  comment?: string;
  verified_purchase: boolean;
  is_mine: boolean;
  is_demo?: boolean;
  review_image?: string;
  created_at: string;
};

type ReviewData = {
  summary: { average: number; total: number; breakdown: Record<string, number> };
  reviews: ProductReview[];
  can_review: boolean;
  order_item_id?: string;
  user_review?: { id: string; rating: number; title?: string; comment?: string; review_image?: string } | null;
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
  const [apiProduct, setApiProduct] = useState<DetailProduct | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    apiFetch(`/api/products/${encodeURIComponent(id)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((product) => {
        if (cancelled || !product) return;

        setApiProduct({
          id: String(product.id),
          brand: product.brand || 'Shopore',
          name: product.name || product.description || 'Product',
          description: product.description || product.name || 'Product',
          image: product.image || product.images?.[0] || '',
          price: Number(product.price || 0),
          originalPrice: product.originalPrice == null ? undefined : Number(product.originalPrice),
          category: product.category,
          subCategory: product.subCategory,
          size: product.variants?.[0]?.size,
          color: product.variants?.[0]?.color,
          rating: Number(product.rating || 0),
          reviews: Number(product.reviews || 0),
          sizeOptions: Array.isArray(product.sizeOptions) ? product.sizeOptions : undefined,
        });
      })
      .catch(() => {
        if (!cancelled) setApiProduct(null);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const product = useMemo<DetailProduct | null>(() => {
    if (apiProduct) return apiProduct;

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
  }, [apiProduct, fallbackProduct, id, query]);

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
  const [reviewData, setReviewData] = useState<ReviewData>({
    summary: { average: 0, total: 0, breakdown: {} },
    reviews: [],
    can_review: false,
  });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImage, setReviewImage] = useState('');
  const [previewReviewImage, setPreviewReviewImage] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewEditorOpen, setReviewEditorOpen] = useState(false);

  const loadReviews = React.useCallback(async () => {
    const productId = Number(apiProduct?.id || id);
    if (!Number.isInteger(productId) || productId <= 0) {
      setReviewsLoading(false);
      return;
    }

    const user = getUser();
    const queryString = user?.id ? `?user_id=${encodeURIComponent(user.id)}` : '';
    try {
      const response = await apiFetch(`/api/reviews/product/${productId}${queryString}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load reviews.');

      setReviewData(data);
      if (data.user_review) {
        setReviewRating(Number(data.user_review.rating || 0));
        setReviewTitle(data.user_review.title || '');
        setReviewComment(data.user_review.comment || '');
        setReviewImage(data.user_review.review_image || '');
      }
    } catch {
      setReviewData({ summary: { average: 0, total: 0, breakdown: {} }, reviews: [], can_review: false });
    } finally {
      setReviewsLoading(false);
    }
  }, [apiProduct?.id, id]);

  React.useEffect(() => {
    setReviewsLoading(true);
    loadReviews();
  }, [loadReviews]);

  const wishlistId = product ? `${getDepartment(product)}-${product.id}` : '';

  React.useEffect(() => {
    if (!wishlistId) return;

    const syncWishlistState = () => setIsWishlisted(isInWishlist(wishlistId));
    syncWishlistState();
    refreshWishlist().then(syncWishlistState).catch(() => syncWishlistState());
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
  const sizes = getProductSizeOptions({ ...product, department: getDepartment(product) });
  const hasProductSizeSelection = sizes.length > 0;
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
    size: hasProductSizeSelection ? selectedSize : undefined,
    department: getDepartment(product),
    category: product.category,
    subCategory: product.subCategory,
    description: product.description,
    sizeOptions: product.sizeOptions,
    href: buildProductHref(product, hasProductSizeSelection ? selectedSize : product.size),
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
    if (hasProductSizeSelection && !selectedSize) {
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

  const submitReview = async () => {
    const user = getUser();
    if (!user?.id) {
      toast.error('Please login to review this product.');
      return;
    }
    if (!reviewData.can_review || !reviewData.order_item_id) {
      toast.error('Only customers who purchased this product can review it.');
      return;
    }
    if (reviewRating < 1) {
      toast.error('Please choose a star rating.');
      return;
    }
    if (reviewComment.trim().length < 10) {
      toast.error('Please write at least 10 characters.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const response = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          product_id: Number(product.id),
          order_item_id: Number(reviewData.order_item_id),
          rating: reviewRating,
          title: reviewTitle.trim(),
          comment: reviewComment.trim(),
          image_data_url: reviewImage || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save review.');

      toast.success(result.message || 'Review saved successfully.');
      await loadReviews();
      setReviewEditorOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-3 pb-10 pt-[96px] font-['DM_Sans',Inter,sans-serif] text-[#071225] sm:px-4 md:px-12">
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

      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 sm:gap-8 2xl:grid-cols-[minmax(420px,520px)_minmax(0,1fr)] xl:grid-cols-[minmax(400px,500px)_minmax(0,1fr)] xl:gap-10">
        <section className="lg:self-stretch">
          <div className="lg:sticky lg:top-[96px]">
            <div className="relative mx-auto aspect-[4/5] max-h-[560px] w-full max-w-[460px] overflow-hidden bg-white">
              <Image
                src={product.image}
                alt={`${product.brand} ${product.name}`}
                fill
                priority
                className="object-contain p-4 sm:p-8 lg:p-10"
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
                onClick={async () => {
                  try {
                    const added = await toggleWishlist(wishlistProduct);
                    setIsWishlisted(added);
                    toast.success(added ? 'Added to your Wishlist' : 'Removed from Wishlist');
                  } catch (error) {
                    setIsWishlisted(false);
                    toast.error(error instanceof Error ? error.message : 'Could not update wishlist');
                  }
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
            <a href="#ratings-reviews" className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[#071225]">
              <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-white">
                {(reviewData.summary.average || product.rating || 0).toFixed(1)} <Star size={12} className="fill-current" />
              </span>
              <span className="text-slate-500">{reviewData.summary.total || product.reviews || 0} ratings & reviews</span>
            </a>
          </div>

          {hasProductSizeSelection && (
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

      <section id="ratings-reviews" className="mx-auto mt-12 w-full max-w-[1500px] border-t border-slate-200 pt-9">
        <h2 className="text-[24px] font-semibold uppercase text-[#071225]">Ratings & Reviews</h2>

        {reviewsLoading ? (
          <div className="py-12 text-center text-[14px] text-slate-500">Loading ratings and reviews...</div>
        ) : (
          <div className="mt-7 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div>
              <div className="rounded-lg border border-slate-200 p-6">
                <div className="flex items-end gap-3">
                  <span className="text-[44px] font-bold leading-none">{reviewData.summary.average.toFixed(1)}</span>
                  <div>
                    <div className="flex gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={18} className={star <= Math.round(reviewData.summary.average) ? 'fill-current' : 'text-slate-200'} />
                      ))}
                    </div>
                    <p className="mt-1 text-[13px] text-slate-500">Based on {reviewData.summary.total} reviews</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviewData.summary.breakdown[String(rating)] || 0;
                    const width = reviewData.summary.total ? (count / reviewData.summary.total) * 100 : 0;
                    return (
                      <div key={rating} className="grid grid-cols-[28px_1fr_28px] items-center gap-2 text-[12px] text-slate-600">
                        <span>{rating}★</span>
                        <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
                        </span>
                        <span className="text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {reviewData.can_review ? (
                reviewEditorOpen ? (
                  <div id="review-editor" className="mt-5 rounded-lg border border-slate-200 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[17px] font-semibold">{reviewData.user_review ? 'Edit your review' : 'Write a review'}</h3>
                        <p className="mt-1 text-[12px] font-semibold text-emerald-700">Verified purchase</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReviewEditorOpen(false)}
                        className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#071225]"
                        aria-label="Close review editor"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setReviewRating(star)} aria-label={`${star} stars`}>
                          <Star size={28} className={star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                        </button>
                      ))}
                    </div>
                    <input
                      value={reviewTitle}
                      onChange={(event) => setReviewTitle(event.target.value)}
                      placeholder="Review title (optional)"
                      maxLength={200}
                      className="mt-4 h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#071225]"
                    />
                    <textarea
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                      placeholder="Tell other customers about this product"
                      maxLength={2000}
                      rows={4}
                      className="mt-3 w-full resize-none border border-slate-300 p-3 text-[13px] outline-none focus:border-[#071225]"
                    />
                    <div className="mt-3">
                      {reviewImage ? (
                        <div className="relative h-36 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          <img src={reviewImage} alt="Review product preview" className="h-full w-full object-contain" />
                          <button type="button" onClick={() => setReviewImage('')} className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-slate-600 shadow" aria-label="Remove review photo">
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-[#071225] hover:bg-white">
                          <Camera size={22} className="text-slate-500" />
                          <span className="mt-2 text-[13px] font-semibold text-[#071225]">Add a product photo</span>
                          <span className="mt-0.5 text-[11px] text-slate-400">Optional · JPG, PNG or WEBP · max 2 MB</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error('Review photo must be smaller than 2 MB.');
                                event.target.value = '';
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => setReviewImage(String(reader.result || ''));
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setReviewEditorOpen(false)}
                        className="h-11 border border-slate-300 text-[14px] font-semibold text-[#071225]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={submitReview}
                        disabled={reviewSubmitting}
                        className="h-11 bg-[#071225] text-[14px] font-semibold text-white disabled:opacity-60"
                      >
                        {reviewSubmitting ? 'Saving...' : reviewData.user_review ? 'Save Changes' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                ) : (
                  !reviewData.user_review && (
                    <button
                      type="button"
                      onClick={() => setReviewEditorOpen(true)}
                      className="mt-5 h-11 w-full rounded border border-[#071225] bg-white text-[14px] font-semibold text-[#071225] transition hover:bg-[#071225] hover:text-white"
                    >
                      Write a review
                    </button>
                  )
                )
              ) : (
                <p className="mt-5 rounded-lg bg-slate-50 p-4 text-[13px] text-slate-600">
                  Purchase this product while logged in to write a verified review.
                </p>
              )}
            </div>

            <div className="self-start space-y-4">
              {reviewData.reviews.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
                  <Star className="mx-auto text-slate-300" size={34} />
                  <p className="mt-3 text-[15px] font-semibold">No reviews yet</p>
                  <p className="mt-1 text-[13px] text-slate-500">Be the first verified buyer to review this product.</p>
                </div>
              ) : reviewData.reviews.map((review) => (
                <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071225] text-[14px] font-bold uppercase text-white">
                      {review.user_name.trim().charAt(0) || 'S'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-[#071225]">{review.user_name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                        {review.verified_purchase && <span className="font-semibold text-emerald-700">✓ Verified Buyer</span>}
                        <span className="text-slate-400">{new Date(review.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-[12px] font-bold text-white">
                      {review.rating} <Star size={11} className="fill-current" />
                    </span>
                    <h3 className="text-[15px] font-semibold">{review.title || 'Customer review'}</h3>
                    {review.is_mine && (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewEditorOpen(true);
                          window.setTimeout(() => document.getElementById('review-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
                        }}
                        className="rounded border border-blue-200 px-2 py-1 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-50"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-[14px] leading-6 text-slate-700">{review.comment}</p>
                  {review.review_image && (
                    <button
                      type="button"
                      onClick={() => setPreviewReviewImage(review.review_image || '')}
                      className="group relative mt-4 block h-48 w-full max-w-[260px] cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                      aria-label="Open review image"
                    >
                      <img src={review.review_image} alt="Customer product review" className="h-full w-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-center text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                        Click to view
                      </span>
                    </button>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
      {previewReviewImage && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={() => setPreviewReviewImage('')}
          role="dialog"
          aria-modal="true"
          aria-label="Review image preview"
        >
          <button
            type="button"
            onClick={() => setPreviewReviewImage('')}
            className="absolute right-5 top-5 rounded-full bg-white p-2 text-[#071225] shadow-lg"
            aria-label="Close image preview"
          >
            <X size={22} />
          </button>
          <img
            src={previewReviewImage}
            alt="Full-size customer review"
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
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
