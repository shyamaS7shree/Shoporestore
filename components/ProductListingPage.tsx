'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Heart,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Plus,
  Minus,
  SlidersHorizontal,
  PackageSearch,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { getWishlistEventName, isInWishlist, refreshWishlist, toggleWishlist } from '@/lib/wishlist';

export interface Product {
  id: number;
  brand: string;
  name?: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  offer?: string;
  image?: string;
  category?: string;
  subCategory?: string;
  size?: string;
  color?: string;
  fit?: string;
}

export interface FilterSection {
  label: string;
  options?: string[];
}

export interface CategoryConfig {
  title: string;
  totalProducts: number;
  accentColor: string;
  brands: string[];
  filters: FilterSection[];
  products: Product[];
}

interface ProductListingPageProps {
  config: CategoryConfig;
}

// ─── Filter Item ────────────────────────────────────────────────────────────

function FilterItem({
  section,
  accentColor,
  selectedOptions,
  onToggle,
}: {
  section: FilterSection;
  accentColor: string;
  selectedOptions: string[];
  onToggle: (option: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const options = section.options || [];
  const visibleOptions = showAll ? options : options.slice(0, 6);
  const isPriceFilter = section.label.toLowerCase() === 'price';

  return (
    <div className="border-b border-gray-100 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between text-left text-[14px] font-semibold text-gray-800"
      >
        {section.label}
        {open ? <Minus size={15} /> : <Plus size={15} />}
      </button>

      {open && options.length > 0 && (
        <div className="mt-4 space-y-3">
          {visibleOptions.map((option) => {
            const checked = selectedOptions.includes(option);
            return (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-3 text-[13px] text-gray-700"
              >
                <button
                  type="button"
                  onClick={() => onToggle(option)}
                  className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition"
                  style={{
                    borderColor: checked ? accentColor : '#d1d5db',
                    backgroundColor: checked ? accentColor : '#ffffff',
                  }}
                >
                  {checked && (
                    <span className="text-[10px] font-bold text-white">✓</span>
                  )}
                </button>
                <span
                  className={
                    isPriceFilter
                      ? 'rounded-full bg-gray-50 px-2.5 py-1 text-[12px] font-semibold text-gray-800'
                      : 'truncate'
                  }
                >
                  {option}
                </span>
              </label>
            );
          })}

          {options.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="cursor-pointer text-[12px] font-bold"
              style={{ color: accentColor }}
            >
              {showAll ? 'SHOW LESS' : `SEE MORE (${options.length - 6})`}
            </button>
          )}
        </div>
      )}

      {open && section.label.toLowerCase() === 'price' && options.length === 0 && (
        <div className="mt-4">
          <div className="mb-3 flex gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={100}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[12px] text-gray-800 outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              defaultValue={10000}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[12px] text-gray-800 outline-none"
            />
          </div>
          <input
            type="range"
            min={100}
            max={10000}
            defaultValue={5000}
            className="w-full"
            style={{ accentColor }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Product Card (no image) ─────────────────────────────────────────────────

function CompactSizeFilter({
  section,
  selectedOptions,
  onToggle,
}: {
  section: FilterSection;
  selectedOptions: string[];
  onToggle: (option: string) => void;
}) {
  const options = section.options || ['XS', 'S', 'M', 'L', 'XL', '2X'];

  return (
    <div className="border-b border-gray-100 pb-4">
      <h3 className="mb-3 text-[13px] font-bold text-gray-900">Size</h3>
      <div className="flex flex-wrap gap-1.5">
        {options.slice(0, 6).map((option) => {
          const selected = selectedOptions.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className="flex h-8 min-w-9 cursor-pointer items-center justify-center border px-2.5 text-[12px] font-bold transition"
              style={{
                borderColor: selected ? '#111827' : '#d7dbe0',
                backgroundColor: selected ? '#111827' : '#ffffff',
                color: selected ? '#ffffff' : '#4b5563',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CompactAvailabilityFilter({ productCount }: { productCount: number }) {
  return (
    <div className="border-b border-gray-100 py-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-gray-900">Availability</h3>
        <ChevronDown size={13} className="text-gray-500" />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-gray-700">
        <span className="h-3.5 w-3.5 border border-gray-300 bg-white" />
        Availability <span className="text-blue-600">({productCount})</span>
      </label>
      <label className="mt-2 flex cursor-pointer items-center gap-2 text-[13px] font-medium text-gray-700">
        <span className="h-3.5 w-3.5 border border-gray-300 bg-white" />
        Out of Stock <span className="text-blue-600">(0)</span>
      </label>
    </div>
  );
}

function getCompactFilterLabel(label: string) {
  const normalized = label.toLowerCase();
  if (normalized === 'categories' || normalized === 'sub-categories') return 'Category';
  if (normalized === 'color') return 'Colors';
  if (normalized === 'price') return 'Price Range';
  if (normalized === 'discount') return 'Ratings';
  if (normalized === 'brands') return 'Tags';
  return label;
}

function CompactFilterRow({
  section,
  selectedOptions,
  onToggle,
}: {
  section: FilterSection;
  selectedOptions: string[];
  onToggle: (option: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = section.options || [];

  return (
    <div className="border-b border-gray-100 py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between text-left text-[14px] font-bold text-gray-900"
      >
        {getCompactFilterLabel(section.label)}
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {open && options.length > 0 && (
        <div className="mt-3 space-y-2.5">
          {options.slice(0, 8).map((option) => {
            const selected = selectedOptions.includes(option);
            return (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-gray-700"
              >
                <button
                  type="button"
                  onClick={() => onToggle(option)}
                  className="flex h-3.5 w-3.5 shrink-0 items-center justify-center border"
                  style={{
                    borderColor: selected ? '#111827' : '#d1d5db',
                    backgroundColor: selected ? '#111827' : '#ffffff',
                  }}
                >
                  {selected && <span className="text-[9px] font-bold text-white">✓</span>}
                </button>
                <span className="truncate">{option}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  accentColor,
  listingTitle,
}: {
  product: Product;
  accentColor: string;
  listingTitle: string;
}) {
  const department = getDepartmentFromTitle(listingTitle);
  const wishlistId = `${department}-${product.id}`;
  const [liked, setLiked] = useState(false);
  const productHref = {
    pathname: `/products/${product.id}`,
    query: {
      department,
      brand: product.brand,
      name: product.name || product.description,
      description: product.description,
      image: product.image || '',
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      size: product.size || '',
      color: product.color || '',
      fit: product.fit || '',
    },
  };
  const wishlistProduct = {
    id: wishlistId,
    brand: product.brand,
    name: product.name || product.description,
    image: product.image || '',
    price: product.price,
    originalPrice: product.originalPrice,
    discount: product.discount,
    department,
    category: product.category,
    subCategory: product.subCategory,
    size: product.size,
    color: product.color,
    fit: product.fit,
    href: `/products/${product.id}?department=${encodeURIComponent(department)}&brand=${encodeURIComponent(product.brand)}&name=${encodeURIComponent(product.name || product.description)}&description=${encodeURIComponent(product.description)}&image=${encodeURIComponent(product.image || '')}&price=${product.price}&originalPrice=${product.originalPrice || ''}&category=${encodeURIComponent(product.category || '')}&subCategory=${encodeURIComponent(product.subCategory || '')}&size=${encodeURIComponent(product.size || '')}&color=${encodeURIComponent(product.color || '')}&fit=${encodeURIComponent(product.fit || '')}`,
  };

  useEffect(() => {
    const syncWishlistState = () => setLiked(isInWishlist(wishlistId));
    syncWishlistState();
    refreshWishlist().then(syncWishlistState).catch(() => syncWishlistState());
    window.addEventListener(getWishlistEventName(), syncWishlistState);
    window.addEventListener('storage', syncWishlistState);

    return () => {
      window.removeEventListener(getWishlistEventName(), syncWishlistState);
      window.removeEventListener('storage', syncWishlistState);
    };
  }, [wishlistId]);

  return (
    <Link href={productHref} className="group block cursor-pointer">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={`${product.brand} ${product.name || product.description}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="text-[13px] font-bold text-gray-500">{product.brand}</span>
            <span className="text-[11px] leading-snug text-gray-400">{product.name || product.description}</span>
          </div>
        )}

        {product.discount && (
          <span
            className="absolute left-2 top-2 rounded px-2 py-1 text-[11px] font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {product.discount}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              const added = await toggleWishlist(wishlistProduct);
              setLiked(added);
              toast.success(added ? 'Added to your Wishlist' : 'Removed from Wishlist');
            } catch (error) {
              setLiked(false);
              toast.error(error instanceof Error ? error.message : 'Could not update wishlist');
            }
          }}
          className="absolute right-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Heart
            size={17}
            color={liked ? '#ef4444' : '#6b7280'}
            fill={liked ? '#ef4444' : 'none'}
          />
        </button>
      </div>

      <div className="pt-3">
        <h3 className="truncate text-[11px] font-bold text-gray-900 md:text-[13px]">
          {product.brand}
        </h3>
        <p className="mt-1 truncate text-[11px] text-gray-500 md:text-[12px]">
          {product.name || product.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-bold text-gray-950 md:text-[14px]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] text-gray-400 line-through md:text-[12px]">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          {product.discount && (
            <span className="text-[11px] font-bold text-emerald-600 md:text-[12px]">
              {product.discount}% Off
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function getDepartmentFromTitle(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('women')) return 'women';
  if (normalized.includes('kid') || normalized.includes('boy') || normalized.includes('girl')) return 'kids';
  if (normalized.includes('home')) return 'home';
  if (normalized.includes('beauty')) return 'beauty';
  if (normalized.includes('genz')) return 'genz';
  return 'men';
}

function normalizeImagePath(path?: string) {
  try {
    return decodeURIComponent(path || '').toLowerCase();
  } catch {
    return (path || '').toLowerCase();
  }
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProductListingPage({ config }: ProductListingPageProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Popularity');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Global filter state: map of filterLabel -> selected options[]
  const [filterSelections, setFilterSelections] = useState<Record<string, string[]>>({});

  // Active brand pills
  const [activeBrands, setActiveBrands] = useState<string[]>([]);

  const sortOptions = [
    'Popularity',
    'New Arrivals',
    'Discount',
    'Price Low to High',
    'Price High to Low',
  ];

  // Toggle a filter option
  const toggleFilterOption = (label: string, option: string) => {
    setFilterSelections((prev) => {
      const existing = prev[label] || [];
      const updated = existing.includes(option)
        ? existing.filter((o) => o !== option)
        : [...existing, option];
      return { ...prev, [label]: updated };
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterSelections({});
    setActiveBrands([]);
  };

  // Toggle brand pill
  const toggleBrand = (brand: string) => {
    setActiveBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const hasActiveFilters =
    activeBrands.length > 0 ||
    Object.values(filterSelections).some((v) => v.length > 0);

  useEffect(() => {
    let cancelled = false;
    const department = getDepartmentFromTitle(config.title);

    setApiLoaded(false);

    apiFetch(`/api/products?category=${encodeURIComponent(department)}`)
      .then((response) => {
        if (!response.ok) throw new Error('Products API failed');
        return response.json();
      })
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;

        const normalizedProducts = data.map((product: any) => ({
          id: Number(product.id),
          brand: product.brand || 'Shopore',
          name: product.name || product.description || 'Product',
          description: product.description || product.name || 'Product',
          price: Number(product.price || 0),
          originalPrice: product.originalPrice == null ? undefined : Number(product.originalPrice),
          image: product.image || product.images?.[0] || '',
          category: product.category,
          subCategory: product.subCategory,
          size: product.variants?.[0]?.size,
          color: product.variants?.[0]?.color,
        })).filter((product: Product) => Number.isFinite(product.id) && product.id > 0);

        const sectionProductsByImage = new Map(
          config.products
            .filter((product) => product.image)
            .map((product) => [normalizeImagePath(product.image), product])
        );

        const matchingProducts = normalizedProducts
          .map((product: Product) => {
            const sectionProduct = sectionProductsByImage.get(normalizeImagePath(product.image));
            if (!sectionProduct) return null;

            return {
              ...sectionProduct,
              ...product,
              category: sectionProduct.category || product.category,
              subCategory: sectionProduct.subCategory || product.subCategory,
              size: sectionProduct.size || product.size,
              color: sectionProduct.color || product.color,
              fit: sectionProduct.fit || product.fit,
              discount: sectionProduct.discount,
              offer: sectionProduct.offer,
            };
          })
          .filter(Boolean) as Product[];

        setApiProducts(matchingProducts);
        setApiAvailable(true);
        setApiLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setApiProducts([]);
        setApiAvailable(false);
        setApiLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [config.title, config.products]);

  const catalogProducts = apiLoaded && apiAvailable ? apiProducts : apiLoaded ? config.products : [];

  // Build filtered + sorted product list
  const products = useMemo(() => {
    let list = [...catalogProducts];

    // Filter by active brand pills
    if (activeBrands.length > 0) {
      list = list.filter((p) => activeBrands.includes(p.brand));
    }

    // Filter by sidebar brand selections
    const selectedBrands = filterSelections['Brands'] || [];
    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.brand));
    }

    const selectedSubCategories = filterSelections['Sub-Categories'] || [];
    if (selectedSubCategories.length > 0) {
      list = list.filter((p) =>
        selectedSubCategories.includes(p.subCategory || p.description)
      );
    }

    const selectedCategories = filterSelections['Categories'] || [];
    if (selectedCategories.length > 0) {
      list = list.filter((p) => p.category && selectedCategories.includes(p.category));
    }

    const selectedPrices = filterSelections['Price'] || [];
    if (selectedPrices.length > 0) {
      list = list.filter((p) =>
        selectedPrices.some((option) => {
          const normalizedOption = option
            .toLowerCase()
            .replace(/rs\.?|₹|,/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          if (/under 299|under 300/.test(normalizedOption)) return p.price < 300;
          if (/under 499|under 500/.test(normalizedOption)) return p.price < 500;
          if (/under 699|under 700/.test(normalizedOption)) return p.price < 700;
          if (/under 999|under 1000/.test(normalizedOption)) return p.price < 1000;
          if (/under 4999|under 5000/.test(normalizedOption)) return p.price < 5000;
          if (/300.*599/.test(normalizedOption)) return p.price >= 300 && p.price <= 599;
          if (/500.*999/.test(normalizedOption)) return p.price >= 500 && p.price <= 999;
          if (/600.*999/.test(normalizedOption)) return p.price >= 600 && p.price <= 999;
          if (/1000.*1999/.test(normalizedOption)) return p.price >= 1000 && p.price <= 1999;
          if (/2000.*2999/.test(normalizedOption)) return p.price >= 2000 && p.price <= 2999;
          if (/3000\+/.test(normalizedOption)) return p.price >= 3000;
          if (/1000\+/.test(normalizedOption)) return p.price >= 1000;
          if (/2000\+/.test(normalizedOption)) return p.price >= 2000;
          return true;
        })
      );
    }

    const selectedDiscounts = filterSelections['Discount'] || [];
    if (selectedDiscounts.length > 0) {
      const minDiscount = Math.min(
        ...selectedDiscounts
          .map((option) => Number(option.match(/\d+/)?.[0] || 0))
          .filter(Boolean)
      );
      list = list.filter((p) => (p.discount || 0) >= minDiscount);
    }

    const selectedSizes = filterSelections['Size'] || [];
    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.size && selectedSizes.includes(p.size));
    }

    const selectedColors = filterSelections['Color'] || [];
    if (selectedColors.length > 0) {
      list = list.filter((p) => p.color && selectedColors.includes(p.color));
    }

    const selectedFits = filterSelections['Fit'] || [];
    if (selectedFits.length > 0) {
      list = list.filter((p) => p.fit && selectedFits.includes(p.fit));
    }

    // Sort
    if (sortBy === 'Price Low to High') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'Price High to Low') list.sort((a, b) => b.price - a.price);
    if (sortBy === 'Discount') list.sort((a, b) => (b.discount || 0) - (a.discount || 0));

    return list;
  }, [catalogProducts, sortBy, activeBrands, filterSelections]);

  const renderFilterPanel = () => {
    const sizeFilter = config.filters.find((filter) => filter.label.toLowerCase() === 'size');
    const visibleFilters = config.filters.filter((filter) => filter.label.toLowerCase() !== 'size');
    const existingLabels = new Set(
      visibleFilters.map((filter) => getCompactFilterLabel(filter.label).toLowerCase())
    );
    const collectionOptions = Array.from(
      new Set(
        catalogProducts
          .map((product) => product.subCategory || product.category || product.description)
          .filter(Boolean)
      )
    ).slice(0, 8) as string[];
    const tagOptions = Array.from(new Set([...config.brands, ...catalogProducts.map((product) => product.brand)])).slice(0, 8);
    const ratingOptions = ['4 Stars & Above', '3 Stars & Above', 'New Arrivals', 'Best Sellers'];
    const extraRowOptions: Record<string, string[]> = {
      Collections: collectionOptions,
      Tags: tagOptions,
      Ratings: ratingOptions,
    };
    const extraRows = ['Collections', 'Tags', 'Ratings']
      .filter((label) => !existingLabels.has(label.toLowerCase()))
      .map((label) => ({ label, options: extraRowOptions[label] || [] }));

    return (
      <div className="bg-white px-1 text-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-gray-950">Filters</h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="cursor-pointer text-[13px] font-bold"
              style={{ color: config.accentColor }}
            >
              Clear
            </button>
          )}
        </div>

        {sizeFilter && (
          <CompactSizeFilter
            section={sizeFilter}
            selectedOptions={filterSelections[sizeFilter.label] || []}
            onToggle={(option) => toggleFilterOption(sizeFilter.label, option)}
          />
        )}

        <CompactAvailabilityFilter productCount={products.length} />

        {[...visibleFilters, ...extraRows].map((filter) => (
          <CompactFilterRow
            key={filter.label}
            section={filter}
            selectedOptions={filterSelections[filter.label] || []}
            onToggle={(option) => toggleFilterOption(filter.label, option)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white pt-[92px]">
        {/* Breadcrumb — normal flow, right below navbar offset */}
        <div className="bg-white px-6 pb-2 text-[14px] text-gray-500">
          Home / {getDepartmentFromTitle(config.title).replace(/^./, (letter) => letter.toUpperCase())} /{' '}
          <span className="font-semibold text-gray-900">{config.title}</span>
        </div>

        <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-4 md:px-6">
          {/* Sidebar — sticky starts below navbar+breadcrumb = 92+37=129px */}
          <aside className="sticky top-[110px] hidden h-[calc(100vh-110px)] w-[260px] shrink-0 overflow-y-auto lg:block">
            {renderFilterPanel()}
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1">
            {/* Title + Sort — no box, just a plain row */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-[22px] font-bold text-gray-950">
                  {config.title}
                </h1>
                <p className="mt-0.5 text-[13px] text-gray-500">
                  {products.length.toLocaleString()} Products
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile filter trigger */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold lg:hidden"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSortOpen((v) => !v)}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[13px]"
                  >
                    <span className="text-gray-500">Sort By</span>
                    <span className="font-bold text-gray-900">{sortBy}</span>
                    {sortOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {sortOpen && (
                    <div className="absolute right-0 top-12 z-40 w-[210px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSortBy(option);
                            setSortOpen(false);
                          }}
                          className="block w-full cursor-pointer px-5 py-3 text-left text-[13px] hover:bg-pink-50"
                          style={{
                            color: sortBy === option ? config.accentColor : '#374151',
                            fontWeight: sortBy === option ? 700 : 500,
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Brand pills */}
            <div className="mb-6 flex flex-wrap gap-2">
              {config.brands.map((brand) => {
                const active = activeBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className="cursor-pointer rounded-full border px-4 py-1.5 text-[12px] font-medium transition"
                    style={{
                      borderColor: active ? config.accentColor : '#e5e7eb',
                      backgroundColor: active ? config.accentColor : '#ffffff',
                      color: active ? '#ffffff' : '#374151',
                    }}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>

            {/* Product grid or No Results */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <PackageSearch size={48} className="mb-4 text-gray-300" />
                <h3 className="text-[18px] font-bold text-gray-700">No results found</h3>
                <p className="mt-2 text-[13px] text-gray-400">
                  Try adjusting your filters or clearing them to see more products.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-5 cursor-pointer rounded-full px-6 py-2 text-[13px] font-bold text-white transition"
                  style={{ backgroundColor: config.accentColor }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    accentColor={config.accentColor}
                    listingTitle={config.title}
                  />
                ))}
              </div>
            )}

            {products.length > 0 && (
              <div className="flex justify-center py-12">
              </div>
            )}
          </main>
        </div>

        {/* Mobile filter drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-[200] bg-black/40 lg:hidden">
            <div className="h-full w-[85%] max-w-[340px] overflow-y-auto bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Filters</h2>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="cursor-pointer text-sm font-bold"
                  style={{ color: config.accentColor }}
                >
                  Close
                </button>
              </div>

              {renderFilterPanel()}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    clearAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="mt-4 w-full cursor-pointer rounded-full py-3 text-[13px] font-bold text-white"
                  style={{ backgroundColor: config.accentColor }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
