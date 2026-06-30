'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CreditCard,
  Mail,
  Package,
  Phone,
  CheckCircle2,
  AlertCircle,
  Camera,
  Save,
  ChevronDown,
  ChevronRight,
  Clock3,
  Headphones,
  RotateCcw,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Tags,
  Truck,
  UserRound,
  ShoppingBag,
  X,
} from 'lucide-react';
import { apiFetch, getRefreshToken, getToken, getUser, saveAuth } from '@/lib/api';
import RoundLoader from '@/components/RoundLoader';
import { addNotification } from '@/lib/notifications';
import { formatEstimatedDelivery } from '@/lib/deliveryEstimate';

type ProfileTab = 'profile' | 'orders' | 'support';

type StoredUser = {
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
};

type Order = {
  id: string;
  order_number?: string;
  total: number;
  status: string;
  created_at: string;
  updated_at?: string;
  payment_id?: string;
  order_items?: Array<{
    id: string;
    product_id?: string;
    quantity: number;
    price: number;
    product_name?: string;
    product_brand?: string;
    product_image?: string;
    product_size?: string;
    product_color?: string;
  }>;
};

type TrackingStep = {
  label: string;
  date: string;
  complete: boolean;
  detail: string;
};

type OrderSnapshotItem = {
  product_id?: string;
  brand?: string;
  name?: string;
  image?: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
};

type ProductImageLookup = Record<string, string>;

const AVATAR_KEY = 'shopore_avatar';
const AVATAR_EVENT = 'shopore-avatar-updated';
const ORDER_SNAPSHOT_KEY = 'shopore-order-snapshots';
const ORDER_STATUS_NOTE_KEY = 'shopore-order-status-notifications';
const PROFILE_EXTRA_KEY = 'shopore_profile_extra'; // stores phone, dob, gender
const INDIA_TIME_ZONE = 'Asia/Kolkata';

function userScopedKey(baseKey: string, user?: StoredUser | null) {
  const userKey = user?.id || user?.email;
  return userKey ? `${baseKey}:${userKey}` : baseKey;
}

// Detect gender from first name using a basic heuristic
// Common Indian male/female name endings
function guessGenderFromName(firstName: string): 'male' | 'female' | 'others' {
  if (!firstName) return 'others';
  const name = firstName.trim().toLowerCase();

  // Common female name endings in Indian context
  const femaleEndings = ['a', 'i', 'ee', 'na', 'ta', 'ia', 'ya', 'ri', 'ti', 'li', 'ni', 'si', 'vi', 'di', 'ki'];
  const maleEndings = ['it', 'an', 'in', 'ar', 'er', 'al', 'en', 'on', 'oy', 'ij'];

  // Explicit known male names override
  const knownMale = ['abhijit', 'rahul', 'rohit', 'amit', 'sumit', 'ankit', 'anil', 'sunil', 'raj', 'vikram', 'ravi', 'sanjay', 'ajay', 'vijay', 'arjun', 'karan', 'nikhil', 'sachin', 'mohan', 'sohan', 'pritam', 'bishnu', 'tapan', 'pradip', 'sankar', 'subir', 'arijit', 'tanmay', 'debraj', 'sourav', 'arnab', 'ayan', 'sayan', 'dipan', 'indrajit', 'biswajit'];
  const knownFemale = ['priya', 'neha', 'pooja', 'asha', 'anita', 'sunita', 'kavita', 'geeta', 'seema', 'reema', 'riya', 'tiya', 'nisha', 'misha', 'disha', 'aisha', 'sneha', 'rekha', 'lekha', 'meena', 'veena', 'leena', 'heena', 'nina', 'tina', 'rina', 'mina', 'sona', 'mona', 'koena', 'shreya', 'preya', 'taniya', 'sania', 'rani', 'bani'];

  if (knownMale.includes(name)) return 'male';
  if (knownFemale.includes(name)) return 'female';

  for (const end of maleEndings) {
    if (name.endsWith(end)) return 'male';
  }
  for (const end of femaleEndings) {
    if (name.endsWith(end)) return 'female';
  }

  return 'others';
}

function splitName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
}

function formatPrice(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}.00`;
}

function parseOrderDate(value: string) {
  if (!value) return new Date();
  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function formatDate(value: string) {
  if (!value) return 'Recently';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: INDIA_TIME_ZONE,
  }).format(parseOrderDate(value));
}

function formatTime(value: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: INDIA_TIME_ZONE,
  }).format(parseOrderDate(value)).replace(/\s/g, '').toLowerCase();
}

function formatDateTime(value: string) {
  return `${formatDate(value)} - ${formatTime(value)}`;
}

function addDaysDateTime(value: string, days: number) {
  const date = parseOrderDate(value);
  date.setDate(date.getDate() + days);
  return formatDateTime(date.toISOString());
}

function shortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function displayOrderNumber(order: Order) {
  return order.order_number || shortOrderId(order.id);
}

function getOrderStatusLabel(status?: string) {
  if (status === 'cod') return 'Cash on Delivery';
  if (status === 'pay_later') return 'Pay Later';
  if (status === 'refund_processing') return 'Refund Processing';
  if (status === 'refunded') return 'Refunded';
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'delivered') return 'Delivered';
  return status || 'paid';
}

function getOrderSummaryStatus(order: Order) {
  if (order.status === 'delivered') {
    return {
      dot: 'bg-emerald-600',
      title: `Delivered on ${formatDate(order.updated_at || order.created_at)}`,
      subtitle: 'Your item has been delivered',
      text: 'text-emerald-700',
    };
  }
  if (order.status === 'cancelled') {
    return {
      dot: 'bg-red-500',
      title: `Cancelled on ${formatDate(order.updated_at || order.created_at)}`,
      subtitle: 'Customer cancellation',
      text: 'text-red-600',
    };
  }
  if (order.status === 'refund_processing') {
    return {
      dot: 'bg-amber-500',
      title: 'Refund processing',
      subtitle: 'Refund will be completed within 2 days',
      text: 'text-amber-700',
    };
  }
  if (order.status === 'refunded') {
    return {
      dot: 'bg-emerald-600',
      title: 'Refund completed',
      subtitle: 'Refund was processed successfully',
      text: 'text-emerald-700',
    };
  }
  return {
    dot: 'bg-emerald-500',
    title: getOrderStatusLabel(order.status),
    subtitle: order.payment_id ? 'Paid by UPI' : order.status === 'cod' ? 'Cash on Delivery' : 'Order is being processed',
    text: 'text-[#071225]',
  };
}

function getTrackingSteps(order: Order): TrackingStep[] {
  const cancelled = ['cancelled', 'refund_processing', 'refunded'].includes(order.status);
  const delivered = order.status === 'delivered';
  const createdAt = order.created_at;

  if (cancelled) {
    const age = daysSince(createdAt);
    const refundDone = order.status === 'refunded' && age >= 2;
    const closed = order.status === 'refunded' && age >= 3;

    return [
      { label: 'Order placed', date: formatDateTime(createdAt), complete: true, detail: 'Your order has been placed.' },
      { label: 'Cancellation requested', date: addDaysDateTime(createdAt, 1), complete: true, detail: 'Cancellation request received.' },
      {
        label: order.status === 'refunded' ? 'Refund successful' : 'Refund update',
        date: addDaysDateTime(createdAt, 2),
        complete: refundDone,
        detail: refundDone ? 'Refund successfully processed.' : 'Refund is being processed.',
      },
      {
        label: 'Order closed',
        date: addDaysDateTime(createdAt, 3),
        complete: closed,
        detail: closed ? 'This order is closed.' : 'Order will close after refund confirmation.',
      },
    ];
  }

  const age = daysSince(createdAt);
  return [
    { label: 'Ordered', date: formatDateTime(createdAt), complete: true, detail: 'Your order has been placed.' },
    { label: 'Packed', date: addDaysDateTime(createdAt, 1), complete: delivered || age >= 1, detail: 'Seller has processed your order.' },
    { label: 'Shipped', date: addDaysDateTime(createdAt, 2), complete: delivered || age >= 2, detail: 'Your item has been picked up by courier partner.' },
    { label: 'Out for delivery', date: addDaysDateTime(createdAt, 3), complete: delivered || age >= 3, detail: 'Shipment is close to your delivery address.' },
    { label: 'Delivered', date: addDaysDateTime(createdAt, 4), complete: delivered || age >= 4, detail: 'Order delivered successfully.' },
  ];
}

function daysSince(value: string) {
  const created = parseOrderDate(value).getTime();
  return Math.floor((Date.now() - created) / (24 * 60 * 60 * 1000));
}

function isOrderShipped(order: Order) {
  const created = parseOrderDate(order.created_at).getTime();
  return Date.now() - created >= 24 * 60 * 60 * 1000 || order.status === 'delivered';
}

function canCancelOrder(order: Order) {
  if (['cancelled', 'refund_processing', 'refunded', 'delivered'].includes(order.status)) return false;
  return !isOrderShipped(order);
}

function getPrimaryOrderItem(items: Array<{
  product_id?: string;
  product_name?: string;
  product_brand?: string;
  product_image?: string;
  product_color?: string;
  price: number;
}> = []) {
  return items[0];
}

async function loadProductImageLookup() {
  const response = await apiFetch('/api/products');
  const products = await response.json();

  if (!Array.isArray(products)) return {};

  return products.reduce<ProductImageLookup>((lookup, product) => {
    const id = String(product.id || '');
    const image = product.image || product.images?.[0];

    if (id && image) {
      lookup[id] = image;
    }

    return lookup;
  }, {});
}

type ToastType = 'profile' | 'avatar' | 'order' | 'orderCancelled' | 'error' | null;

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [user, setUser] = useState<StoredUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [previewAvatarOpen, setPreviewAvatarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSnapshots, setOrderSnapshots] = useState<Record<string, OrderSnapshotItem[]>>({});
  const [productImagesById, setProductImagesById] = useState<ProductImageLookup>({});
  const [productImagesLoaded, setProductImagesLoaded] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoadError, setOrdersLoadError] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState<Order | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastType>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [openSupport, setOpenSupport] = useState<string | null>('orders');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'female' as 'male' | 'female' | 'others',
  });

  // Track original form to detect changes
  const [originalForm, setOriginalForm] = useState({ ...form });
  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  const showToast = useCallback((type: ToastType) => {
    setToast(type);
    setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section === 'orders' || section === 'support') {
      setActiveTab(section as ProfileTab);
    }

    const storedUser = getUser();
    setUser(storedUser);
    setAuthChecked(true);
    setAvatarUrl(localStorage.getItem(userScopedKey(AVATAR_KEY, storedUser)));
    setOrderSnapshots(JSON.parse(localStorage.getItem(ORDER_SNAPSHOT_KEY) || '{}'));

    if (storedUser) {
      const { firstName, lastName } = splitName(storedUser.fullName || storedUser.name || '');
      const profileExtraKey = userScopedKey(PROFILE_EXTRA_KEY, storedUser);

      // Load saved extra profile data (phone, dob, gender)
      const extra = JSON.parse(localStorage.getItem(profileExtraKey) || '{}');

      const detectedGender: 'male' | 'female' | 'others' =
        extra.gender || guessGenderFromName(firstName);

      const loaded = {
        firstName,
        lastName,
        phone: storedUser.phone || extra.phone || '',
        email: storedUser.email || '',
        dateOfBirth: extra.dateOfBirth || '',
        gender: detectedGender,
      };

      setForm(loaded);
      setOriginalForm(loaded);

      // Refresh from Supabase after the quick localStorage load.
      if (storedUser.id) {
        apiFetch(`/api/profile?user_id=${encodeURIComponent(storedUser.id)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!data) return;

            const dbName = splitName(data.name || storedUser.fullName || storedUser.name || '');
            const fromDb = {
              firstName: dbName.firstName,
              lastName: dbName.lastName,
              phone: data.phone || extra.phone || '',
              email: data.email || storedUser.email || '',
              dateOfBirth: data.date_of_birth || extra.dateOfBirth || '',
              gender: (data.gender as 'male' | 'female' | 'others') || detectedGender,
            };

            setForm(fromDb);
            setOriginalForm(fromDb);

            localStorage.setItem(
              profileExtraKey,
              JSON.stringify({
              phone: fromDb.phone,
              dateOfBirth: fromDb.dateOfBirth,
              gender: fromDb.gender,
            }),
          );
            if (fromDb.phone && storedUser.phone !== fromDb.phone) {
              const refreshedUser = { ...storedUser, phone: fromDb.phone };
              const accessToken = getToken() || '';
              const refreshToken = getRefreshToken() || '';
              saveAuth(accessToken, refreshToken, refreshedUser, Boolean(localStorage.getItem('accessToken')));
              setUser(refreshedUser);
            }
          })
          .catch(() => {
            // Keep the localStorage values if the remote profile cannot load.
          });
      }
    }
  }, []);

  const changeTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', tab === 'profile' ? '/profile' : `/profile?section=${tab}`);
  };

  const refreshOrders = useCallback(() => {
    if (!user?.id) return Promise.resolve();

    setOrdersLoading(true);
    setOrdersLoadError(false);
    const controller = new AbortController();
    const requestTimeout = window.setTimeout(() => controller.abort(), 3000);
    const minimumSkeletonTime = new Promise<void>((resolve) => window.setTimeout(resolve, 650));
    const freshOrdersRequest = apiFetch(`/api/orders?user_id=${encodeURIComponent(user.id)}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Orders request failed');
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Invalid orders response');

        setOrders(data);

        const noteKey = userScopedKey(ORDER_STATUS_NOTE_KEY, user);
        const notifiedStatuses = JSON.parse(localStorage.getItem(noteKey) || '{}') as Record<string, string>;
        let changed = false;

        data.forEach((order: Order) => {
          if (notifiedStatuses[order.id] === order.status) return;

          if (order.status === 'delivered') {
            addNotification({
              userId: user.id!,
              type: 'delivery',
              title: 'Order delivered',
              message: `Order ${shortOrderId(order.id)} has been marked delivered.`,
              href: `/profile/orders/${order.id}`,
            });
            notifiedStatuses[order.id] = order.status;
            changed = true;
          }

          if (order.status === 'refunded') {
            addNotification({
              userId: user.id!,
              type: 'refund',
              title: 'Refund completed',
              message: `Refund for order ${shortOrderId(order.id)} has been marked completed.`,
              href: `/profile/orders/${order.id}`,
            });
            notifiedStatuses[order.id] = order.status;
            changed = true;
          }
        });

        if (changed) {
          localStorage.setItem(noteKey, JSON.stringify(notifiedStatuses));
        }
      })
      .catch(() => {
        setOrdersLoadError(true);
      })
      .finally(() => window.clearTimeout(requestTimeout));

    return Promise.all([freshOrdersRequest, minimumSkeletonTime])
      .finally(() => setOrdersLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || activeTab !== 'orders') return;

    setOrderSnapshots(JSON.parse(localStorage.getItem(ORDER_SNAPSHOT_KEY) || '{}'));
    refreshOrders();
  }, [activeTab, refreshOrders, user?.id]);

  useEffect(() => {
    if (activeTab !== 'orders' || productImagesLoaded) return;

    loadProductImageLookup()
      .then((lookup) => {
        setProductImagesById(lookup);
        setProductImagesLoaded(true);
      })
      .catch(() => {
        setProductImagesById({});
        setProductImagesLoaded(true);
      });
  }, [activeTab, productImagesLoaded]);

  const cancelOrder = async (order: Order) => {
    if (!user?.id || cancellingOrderId) return;

    setCancellingOrderId(order.id);

    try {
      const response = await apiFetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          user_id: user.id,
          user_email: user.email,
          user_name: user.fullName || user.name || user.email,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Order cancellation failed');
      }

      setOrders((previous) => previous.map((item) => (item.id === order.id ? result.order : item)));
      addNotification({
        userId: user.id,
        type: result.order?.status === 'refund_processing' ? 'refund' : 'cancel',
        title: result.order?.status === 'refund_processing' ? 'Refund processing started' : 'Order cancelled',
        message:
          result.order?.status === 'refund_processing'
            ? `Order ${shortOrderId(order.id)} is cancelled. Refund processing has started.`
            : `Order ${shortOrderId(order.id)} was cancelled successfully.`,
        href: `/profile/orders/${order.id}`,
      });
      showToast('orderCancelled');
      setCancelConfirmOrder(null);
    } catch (error) {
      console.error('[cancel order] Failed:', error);
      showToast('error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const updateProfile = async () => {
    if (!user || !hasChanges || savingProfile) return;

    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const updatedUser = {
      ...user,
      name: fullName,
      fullName,
    };

    setSavingProfile(true);

    try {
      if (!user.id) {
        throw new Error('Missing user id');
      }

      const res = await apiFetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          name: fullName,
          phone: form.phone,
          date_of_birth: form.dateOfBirth || null,
          gender: form.gender,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Profile update failed');
      }

      const savedForm = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: data.phone || form.phone,
        email: form.email,
        dateOfBirth: data.date_of_birth || form.dateOfBirth,
        gender: (data.gender as 'male' | 'female' | 'others') || form.gender,
      };

      const accessToken = getToken() || '';
      const refreshToken = getRefreshToken() || '';
      saveAuth(accessToken, refreshToken, updatedUser, Boolean(localStorage.getItem('accessToken')));
      setUser(updatedUser);
      setForm(savedForm);
      setOriginalForm(savedForm);
      localStorage.setItem(
        userScopedKey(PROFILE_EXTRA_KEY, user),
        JSON.stringify({
          phone: savedForm.phone,
          dateOfBirth: savedForm.dateOfBirth,
          gender: savedForm.gender,
        }),
      );
      window.dispatchEvent(new Event('storage'));
      showToast('profile');
    } catch (error) {
      console.error('[profile update] Failed:', error);
      showToast('error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPendingAvatarUrl(url);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const saveAvatar = () => {
    if (!pendingAvatarUrl || !user) return;

    localStorage.setItem(userScopedKey(AVATAR_KEY, user), pendingAvatarUrl);
    setAvatarUrl(pendingAvatarUrl);
    setPendingAvatarUrl(null);
    window.dispatchEvent(new Event(AVATAR_EVENT));
    showToast('avatar');
  };

  const firstName = form.firstName || user?.email?.split('@')[0] || 'there';
  const displayAvatarUrl = pendingAvatarUrl || avatarUrl;
  const profileFields = [form.firstName, form.lastName, form.phone, form.email, form.dateOfBirth, displayAvatarUrl];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] px-5 pt-[120px] text-[#071225]">
        <RoundLoader label="Loading profile..." size={44} />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] px-5 pt-[120px] text-[#071225]">
        <div className="mx-auto max-w-[520px] rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-[24px] font-semibold">Please login first</h1>
          <p className="mt-3 text-[14px] text-slate-500">
            Your profile details and orders will appear here after login.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center justify-center rounded bg-[#071225] px-7 text-[14px] font-semibold text-white"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdf4f8_0px,#f7f8fb_240px,#f7f8fb_100%)] px-3 pb-16 pt-[104px] text-[#071225] sm:px-5 md:pt-[86px]">
      {/* Toast Notification */}
      {toast && (
        <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className={`animate-toast-in flex min-w-[280px] items-center gap-3 rounded-xl border bg-white px-6 py-5 shadow-[0_22px_60px_rgba(15,23,42,0.22)] ${toast === 'error' ? 'border-red-200' : 'border-emerald-200'}`}>
            {toast === 'error' ? (
              <AlertCircle size={20} className="shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
            )}
            <p className="text-[14px] font-semibold text-[#071225]">
              {toast === 'error'
                ? 'Profile update failed. Please try again.'
                : toast === 'avatar'
                  ? 'Profile photo updated!'
                  : toast === 'order'
                    ? 'Order updated successfully!'
                    : toast === 'orderCancelled'
                      ? 'Order cancelled successfully!'
                  : 'Profile updated successfully!'}
            </p>
          </div>
        </div>
      )}

      {cancelConfirmOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-[3px]"
        >
          <div className="relative w-full max-w-[420px] rounded-md bg-white px-5 pb-5 pt-12 text-center shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
            <button
              type="button"
              aria-label="Close cancel confirmation"
              onClick={() => setCancelConfirmOrder(null)}
              disabled={cancellingOrderId === cancelConfirmOrder.id}
              className="absolute right-4 top-4 text-slate-600 transition hover:text-[#071225] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={22} />
            </button>
            <div className="absolute left-1/2 top-[-30px] flex h-[58px] w-[58px] -translate-x-1/2 items-center justify-center rounded-full border-[5px] border-white bg-[#d97706] text-[34px] font-black leading-none text-white">
              !
            </div>
            <h2 id="cancel-order-title" className="text-[16px] font-extrabold text-[#071225]">
              Are You Sure You Want To Cancel This Order?
            </h2>
            <p className="mx-auto mt-2 max-w-[330px] text-[12px] leading-5 text-slate-500">
              Once cancelled, this order cannot be shipped. Paid orders will start refund processing after cancellation.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCancelConfirmOrder(null)}
                disabled={cancellingOrderId === cancelConfirmOrder.id}
                className="h-10 border border-slate-300 bg-white text-[14px] font-bold text-[#071225] disabled:cursor-not-allowed disabled:opacity-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => cancelOrder(cancelConfirmOrder)}
                disabled={cancellingOrderId === cancelConfirmOrder.id}
                className="h-10 border border-[#071225] bg-[#071225] text-[14px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancellingOrderId === cancelConfirmOrder.id ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewAvatarOpen && displayAvatarUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5" onClick={() => setPreviewAvatarOpen(false)}>
          <div className="relative h-[min(68vh,420px)] w-[min(86vw,420px)]" onClick={(event) => event.stopPropagation()}>
            <Image
              src={displayAvatarUrl}
              alt="Profile photo preview"
              fill
              className="rounded-xl bg-white object-contain shadow-2xl"
              sizes="420px"
            />
            <button
              type="button"
              onClick={() => setPreviewAvatarOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#071225] shadow-lg transition hover:bg-slate-100"
              aria-label="Close profile photo preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1520px]">
        <div className="relative mb-7 overflow-hidden rounded-[26px] bg-[#071225] px-6 py-7 text-white shadow-[0_22px_60px_rgba(7,18,37,0.16)] sm:px-8 sm:py-9">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-pink-500/20 blur-2xl" />
          <div className="absolute bottom-[-90px] right-[18%] h-52 w-52 rounded-full bg-violet-500/15 blur-2xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pink-300">Shopore account</p>
              <h1 className="mt-3 text-[28px] font-black tracking-[-0.03em] sm:text-[36px]">Welcome back, {firstName}</h1>
              <p className="mt-2 text-[14px] text-slate-300">Manage your profile, purchases and support from one place.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[138px] rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Profile complete</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[20px] font-black">{profileCompletion}%</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                    <span className="block h-full rounded-full bg-pink-400" style={{ width: `${profileCompletion}%` }} />
                  </span>
                </div>
              </div>
              <div className="min-w-[118px] rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Account status</p>
                <p className="mt-1 flex items-center gap-2 text-[16px] font-black">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-5 sm:gap-7 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-[94px]">
            <div className="rounded-[22px] border border-slate-200/80 bg-white px-6 py-7 text-center shadow-[0_12px_38px_rgba(15,23,42,0.06)]">
              <div className="relative mx-auto h-32 w-32 rounded-full">
                <button
                  type="button"
                  onClick={() => displayAvatarUrl && setPreviewAvatarOpen(true)}
                  className="relative block h-32 w-32 rounded-full focus:outline-none focus:ring-4 focus:ring-pink-100"
                  aria-label="Open profile photo"
                >
                  {displayAvatarUrl ? (
                    <Image
                      src={displayAvatarUrl}
                      alt="Profile photo"
                      fill
                      className="rounded-full border-4 border-white object-cover shadow-[0_8px_28px_rgba(236,72,153,0.18)] ring-4 ring-pink-100"
                      sizes="128px"
                    />
                  ) : (
                    <span className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-pink-100 to-violet-100 text-[40px] font-black text-pink-600 ring-4 ring-pink-100">
                      {firstName[0].toUpperCase()}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-pink-500 text-white shadow-lg transition hover:scale-105 hover:bg-pink-600"
                  aria-label="Choose profile photo"
                >
                  <Camera size={18} />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <h2 className="mt-5 truncate text-[18px] font-black">{form.firstName} {form.lastName}</h2>
              <p className="mt-1 truncate text-[12px] text-slate-500">{form.email}</p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[13px] font-semibold text-[#071225] transition hover:border-pink-300 hover:bg-pink-50"
                  aria-label="Change profile photo"
                >
                  <Camera size={15} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={saveAvatar}
                  disabled={!pendingAvatarUrl}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold text-white transition ${
                    pendingAvatarUrl ? 'bg-[#071225] hover:bg-[#111d31]' : 'cursor-not-allowed bg-slate-300'
                  }`}
                >
                  <Save size={15} />
                  Save
                </button>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200/80 bg-white p-2.5 shadow-[0_12px_38px_rgba(15,23,42,0.06)]">
              {[
                { id: 'profile' as const, label: 'My Profile', caption: 'Personal details', icon: UserRound },
                { id: 'orders' as const, label: 'My Orders', caption: 'Track purchases', icon: ShoppingBag },
                { id: 'support' as const, label: 'Help & Support', caption: 'Get assistance', icon: Headphones },
              ].map((item) => {
                const active = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => changeTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition ${active ? 'bg-pink-50 text-pink-600 shadow-sm ring-1 ring-pink-100' : 'text-[#071225] hover:bg-slate-50'}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${active ? 'bg-white text-pink-600 shadow-sm' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-[12px] text-slate-500">{item.caption}</span>
                    </span>
                    <ChevronRight size={17} className={`ml-auto transition ${active ? 'translate-x-0 text-pink-500' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="min-h-[620px] rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_38px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
            {activeTab === 'profile' && (
              <div>
                <div className="mb-7 flex flex-col gap-4 rounded-[22px] border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200/70">
                      <UserRound size={22} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">Profile details</p>
                      <h2 className="mt-1 text-[22px] font-black tracking-[-0.02em]">Personal information</h2>
                      <p className="mt-1 text-[13px] text-slate-500">Keep your contact and personal details up to date.</p>
                    </div>
                  </div>
                  <div className="min-w-[150px] rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Profile strength</span>
                      <span className="text-sky-700">{profileCompletion}%</span>
                    </div>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-sky-100">
                      <span className="block h-full rounded-full bg-sky-500" style={{ width: `${profileCompletion}%` }} />
                    </span>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <ProfileInput
                    label="First Name"
                    value={form.firstName}
                    onChange={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
                  />
                  <ProfileInput
                    label="Last Name"
                    value={form.lastName}
                    onChange={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
                  />
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-[12px] font-semibold text-slate-700">Phone Number</label>
                  <div className="flex h-12 overflow-hidden rounded-xl border border-slate-300 bg-white transition focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-50">
                    <span className="flex w-16 items-center justify-center border-r border-slate-200 bg-slate-50 text-[13px] font-semibold">+91</span>
                    <input
                      value={form.phone}
                      onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                      className="min-w-0 flex-1 px-4 text-[14px] outline-none"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <ProfileInput
                    label="Email ID"
                    value={form.email}
                    readOnly
                  />
                  <p className="mt-2 text-[12px] text-slate-400">Email is used for login and cannot be changed here</p>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-[12px] font-semibold text-slate-700">Date of Birth (optional)</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(event) => setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
                    className="h-12 w-full rounded-xl border border-slate-300 px-4 text-[14px] outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                  />
                  <p className="mt-2 text-[12px] text-slate-400">Avail birthday discounts as a member</p>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-[12px] font-semibold text-slate-700">Gender</p>
                  <div className="flex flex-wrap gap-3 text-[13px] text-slate-600">
                    {(['male', 'female', 'others'] as const).map((gender) => (
                      <label key={gender} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 capitalize transition ${form.gender === gender ? 'border-pink-300 bg-pink-50 text-pink-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input
                          type="radio"
                          name="gender"
                          checked={form.gender === gender}
                          onChange={() => setForm((prev) => ({ ...prev, gender }))}
                          className="h-4 w-4 accent-[#071225]"
                        />
                        {gender}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Update button — disabled unless changes detected */}
                <button
                  type="button"
                  onClick={updateProfile}
                  disabled={!hasChanges || savingProfile}
                  className={`mt-8 h-12 min-w-[210px] rounded-xl px-7 text-[14px] font-bold text-white shadow-sm transition ${hasChanges && !savingProfile
                      ? 'bg-[#071225] hover:-translate-y-0.5 hover:bg-[#111d31] hover:shadow-lg cursor-pointer'
                      : 'bg-slate-300 cursor-not-allowed'
                    }`}
                >
                  {savingProfile ? 'Saving...' : 'Update Changes'}
                </button>
                {!hasChanges && (
                  <p className="mt-2 text-[12px] text-slate-400">Make a change above to enable saving</p>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <div className="mb-7 flex flex-col gap-4 rounded-[22px] border border-amber-100 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200/70">
                      <ShoppingBag size={22} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">Purchase history</p>
                      <h2 className="mt-1 text-[22px] font-black tracking-[-0.02em]">My Orders</h2>
                      <p className="mt-1 text-[13px] text-slate-500">Track every purchase, payment and delivery update.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-amber-100 bg-white px-3 py-2 text-[11px] font-bold text-orange-700 shadow-sm">
                      {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                    </span>
                    <button
                      type="button"
                      onClick={refreshOrders}
                      disabled={ordersLoading}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 text-[12px] font-bold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
                    >
                      <RefreshCw size={14} />
                      {ordersLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                </div>

                {ordersLoading ? (
                  <OrderListSkeleton />
                ) : ordersLoadError && orders.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
                    <AlertCircle className="mx-auto text-amber-600" size={34} />
                    <h3 className="mt-3 text-[16px] font-bold text-slate-900">Orders are taking too long</h3>
                    <p className="mt-2 text-[13px] text-slate-600">The request stopped after 3 seconds. Please try refreshing again.</p>
                    <button
                      type="button"
                      onClick={refreshOrders}
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#071225] px-5 text-[12px] font-bold text-white"
                    >
                      <RefreshCw size={14} /> Try again
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
                    <Package className="mx-auto text-slate-400" size={42} />
                    <h3 className="mt-4 text-[18px] font-semibold">No orders yet</h3>
                    <p className="mt-2 text-[14px] text-slate-500">After payment, your orders will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordersLoadError && (
                      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-semibold text-amber-800">
                        <AlertCircle size={16} /> Refresh timed out after 3 seconds. Showing your previous orders.
                      </div>
                    )}
                    {orders.map((order) => {
                      const snapshotItems = orderSnapshots[order.id] || [];
                      const dbItems = order.order_items || [];
                      const displayItems =
                        dbItems.length > 0
                          ? dbItems.map((item, index) => {
                            const snapshot = snapshotItems[index];
                            const productId = item.product_id || snapshot?.product_id;
                            return {
                              id: item.id,
                              product_id: productId,
                              quantity: item.quantity,
                              price: item.price,
                              product_name: item.product_name || snapshot?.name,
                              product_brand: item.product_brand || snapshot?.brand,
                              product_image: item.product_image || snapshot?.image || (productId ? productImagesById[productId] : undefined),
                              product_size: item.product_size || snapshot?.size,
                              product_color: item.product_color || snapshot?.color,
                            };
                          })
                          : snapshotItems.map((item, index) => ({
                            id: `${order.id}-${index}`,
                            product_id: item.product_id,
                            quantity: item.quantity,
                            price: item.price,
                            product_name: item.name,
                            product_brand: item.brand,
                            product_image: item.image || (item.product_id ? productImagesById[item.product_id] : undefined),
                            product_size: item.size,
                            product_color: item.color,
                          }));
                      const primaryItem = displayItems[0];
                      const status = getOrderSummaryStatus(order);
                      const itemCount = displayItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 1;

                      return (
                        <Link
                          key={order.id}
                          href={`/profile/orders/${order.id}`}
                          className="grid items-center gap-5 rounded-md border border-slate-200 bg-white p-5 text-[#071225] no-underline transition hover:border-pink-200 hover:shadow-sm md:grid-cols-[120px_minmax(0,1fr)_160px_300px]"
                        >
                          <div className="relative h-28 w-24 overflow-hidden rounded bg-slate-100">
                            {primaryItem?.product_image ? (
                              <Image src={primaryItem.product_image} alt={primaryItem.product_name || 'Ordered product'} fill className="object-cover" sizes="96px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">No image</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[16px] font-semibold">{primaryItem?.product_name || 'Shopore Order'}</p>
                            <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-slate-500">
                              {primaryItem?.product_size && <span>Size: {primaryItem.product_size}</span>}
                              <span>Qty: {itemCount}</span>
                            </div>
                          </div>
                          <p className="text-[17px] font-bold md:text-right">{formatPrice(order.total)}</p>
                          <div>
                            <p className={`flex items-center gap-2 text-[14px] font-bold ${status.text}`}>
                              <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                              {status.title}
                            </p>
                            <p className="mt-2 text-[12px] text-slate-600">{status.subtitle}</p>
                            {!['cancelled', 'refund_processing', 'refunded', 'delivered'].includes(order.status) && (
                              <p className="mt-2 text-[12px] font-semibold text-emerald-700">
                                Estimated delivery by {formatEstimatedDelivery(order.created_at)}
                              </p>
                            )}
                            <span className="mt-4 inline-flex text-[12px] font-bold text-blue-600">View details</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'support' && (
              <div>
                <div className="mb-7 flex flex-col gap-4 rounded-[22px] border border-pink-100 bg-gradient-to-r from-pink-50 via-white to-violet-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071225] text-white shadow-lg shadow-slate-300/50">
                      <Headphones size={22} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500">Support center</p>
                      <h2 className="mt-1 text-[22px] font-black tracking-[-0.02em]">How can we help?</h2>
                      <p className="mt-1 text-[13px] text-slate-500">Choose the topic that best matches your question.</p>
                    </div>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 text-[11px] font-semibold text-emerald-700 shadow-sm">
                    <Clock3 size={14} /> Usually replies in 24h
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <SupportCard
                    id="orders"
                    open={openSupport === 'orders'}
                    icon={<Package size={22} />}
                    title="Order Issues"
                    subtitle="Track, cancel or return your order"
                    body="You can check order status in My Orders. For return or cancellation, keep your order ID ready so support can help faster."
                    tone="pink"
                    onClick={() => setOpenSupport(openSupport === 'orders' ? null : 'orders')}
                  />
                  <SupportCard
                    id="payments"
                    open={openSupport === 'payments'}
                    icon={<CreditCard size={22} />}
                    title="Payment & Refunds"
                    subtitle="Payment failed, refund pending, or amount deducted"
                    body="If payment is deducted but order is not created, wait a few minutes and refresh My Orders. Refunds usually return to the original payment method based on bank timelines."
                    tone="violet"
                    onClick={() => setOpenSupport(openSupport === 'payments' ? null : 'payments')}
                  />
                  <SupportCard
                    id="delivery"
                    open={openSupport === 'delivery'}
                    icon={<Truck size={22} />}
                    title="Delivery & Tracking"
                    subtitle="Late delivery, tracking updates or address help"
                    body="Open My Orders to see the latest delivery estimate. If tracking has not updated for 24 hours, contact us with your order number and delivery PIN code."
                    tone="blue"
                    onClick={() => setOpenSupport(openSupport === 'delivery' ? null : 'delivery')}
                  />
                  <SupportCard
                    id="returns"
                    open={openSupport === 'returns'}
                    icon={<RotateCcw size={22} />}
                    title="Returns & Exchange"
                    subtitle="Return eligibility, pickup and exchange support"
                    body="Eligible unused items can be returned within the return window. Keep the original tags, packaging and order details ready before requesting pickup."
                    tone="emerald"
                    onClick={() => setOpenSupport(openSupport === 'returns' ? null : 'returns')}
                  />
                  <SupportCard
                    id="size"
                    open={openSupport === 'size'}
                    icon={<Ruler size={22} />}
                    title="Product & Size Help"
                    subtitle="Sizing, product details and availability"
                    body="Check the product page for its size options, photos and stock. For sizing help, compare your measurements with the size guide before ordering."
                    tone="amber"
                    onClick={() => setOpenSupport(openSupport === 'size' ? null : 'size')}
                  />
                  <SupportCard
                    id="offers"
                    open={openSupport === 'offers'}
                    icon={<Tags size={22} />}
                    title="Offers & Coupons"
                    subtitle="Coupon eligibility, discounts and promotions"
                    body="Apply an eligible coupon in your bag before checkout. Some offers have minimum-order, product or payment-method conditions."
                    tone="orange"
                    onClick={() => setOpenSupport(openSupport === 'offers' ? null : 'offers')}
                  />
                  <SupportCard
                    id="account"
                    open={openSupport === 'account'}
                    icon={<ShieldCheck size={22} />}
                    title="Account Help"
                    subtitle="Login, profile and account details"
                    body="For login or profile issues, update your details here first. If the issue continues, contact support with your registered email."
                    tone="slate"
                    onClick={() => setOpenSupport(openSupport === 'account' ? null : 'account')}
                  />
                  <Link
                    href="/contact"
                    className="group relative flex min-h-[124px] items-center gap-4 overflow-hidden rounded-[20px] border border-slate-700 bg-gradient-to-br from-[#071225] to-slate-800 p-5 text-white no-underline shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <span className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-pink-500/20 blur-xl" />
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-pink-300 ring-1 ring-white/10">
                      <Phone size={22} />
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-pink-300">Need more help?</span>
                      <span className="mt-1 block text-[16px] font-bold">Contact Us</span>
                      <span className="mt-1 block text-[13px] text-slate-300">Go to contact page for direct support</span>
                    </span>
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition group-hover:translate-x-1 group-hover:bg-white/15">
                      <Mail size={17} className="text-slate-200" />
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx global>{`
        @keyframes toast-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-toast-in {
          animation: toast-in 0.25s ease forwards;
        }
        @keyframes account-skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .account-skeleton {
          background: linear-gradient(90deg, #e9edf3 25%, #f8fafc 48%, #e9edf3 72%);
          background-size: 200% 100%;
          animation: account-skeleton-shimmer 1.35s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .account-skeleton { animation: none; }
        }
      `}</style>
    </main>
  );
}

function OrderListSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading orders" aria-live="polite">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="grid min-h-[154px] items-center gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[120px_minmax(0,1fr)_160px_300px]"
        >
          <span className="account-skeleton block h-28 w-24 rounded-xl" />
          <span className="min-w-0 space-y-3">
            <span className="account-skeleton block h-4 w-[min(220px,75%)] rounded-full" />
            <span className="account-skeleton block h-3 w-[min(150px,55%)] rounded-full" />
            <span className="flex gap-2">
              <span className="account-skeleton block h-6 w-16 rounded-lg" />
              <span className="account-skeleton block h-6 w-12 rounded-lg" />
            </span>
          </span>
          <span className="account-skeleton block h-5 w-24 rounded-full md:justify-self-end" />
          <span className="space-y-3">
            <span className="account-skeleton block h-4 w-32 rounded-full" />
            <span className="account-skeleton block h-3 w-44 max-w-full rounded-full" />
            <span className="account-skeleton block h-3 w-36 rounded-full" />
          </span>
        </div>
      ))}
      <span className="sr-only">Loading your latest orders…</span>
    </div>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold text-slate-700">
        {label} <span className="text-pink-500">*</span>
      </span>
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        disabled={readOnly}
        className={`h-12 w-full rounded-xl border border-slate-300 px-4 text-[14px] outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50 ${
          readOnly ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''
        }`}
      />
    </label>
  );
}

function SupportCard({
  id,
  icon,
  title,
  subtitle,
  body,
  tone,
  open,
  onClick,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  body: string;
  tone: 'pink' | 'violet' | 'blue' | 'emerald' | 'amber' | 'orange' | 'slate';
  open: boolean;
  onClick: () => void;
}) {
  const palette = {
    pink: { icon: 'bg-pink-100 text-pink-600', surface: 'from-pink-50/80 via-white to-white', border: 'border-pink-200', accent: 'bg-pink-500' },
    violet: { icon: 'bg-violet-100 text-violet-600', surface: 'from-violet-50/80 via-white to-white', border: 'border-violet-200', accent: 'bg-violet-500' },
    blue: { icon: 'bg-blue-100 text-blue-600', surface: 'from-blue-50/80 via-white to-white', border: 'border-blue-200', accent: 'bg-blue-500' },
    emerald: { icon: 'bg-emerald-100 text-emerald-600', surface: 'from-emerald-50/80 via-white to-white', border: 'border-emerald-200', accent: 'bg-emerald-500' },
    amber: { icon: 'bg-amber-100 text-amber-700', surface: 'from-amber-50/80 via-white to-white', border: 'border-amber-200', accent: 'bg-amber-500' },
    orange: { icon: 'bg-orange-100 text-orange-600', surface: 'from-orange-50/80 via-white to-white', border: 'border-orange-200', accent: 'bg-orange-500' },
    slate: { icon: 'bg-slate-100 text-slate-700', surface: 'from-slate-100/80 via-white to-white', border: 'border-slate-300', accent: 'bg-slate-600' },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={`support-${id}`}
      className={`group relative min-h-[124px] w-full overflow-hidden rounded-[20px] border bg-gradient-to-br p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${palette.surface} ${open ? palette.border : 'border-slate-200 hover:border-slate-300'}`}
    >
      <span className={`absolute inset-y-5 left-0 w-1 rounded-r-full transition-all ${palette.accent} ${open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      <span className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-white/80 blur-xl" />
      <span className="relative flex items-center gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-white ${palette.icon}`}>
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Help topic</span>
          <span className="block text-[15px] font-bold">{title}</span>
          <span className="mt-1 block text-[13px] text-slate-500">{subtitle}</span>
        </span>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition ${open ? `${palette.border} rotate-180` : 'border-slate-200 group-hover:border-slate-300'}`}>
          <ChevronDown size={17} className="text-slate-500" />
        </span>
      </span>
      {open && (
        <span id={`support-${id}`} className="relative mt-4 block rounded-xl border border-white bg-white/80 px-4 py-3 text-[13px] leading-6 text-slate-600 shadow-sm">
          {body}
        </span>
      )}
    </button>
  );
}

function OrderTrackingPanel({
  order,
  items,
}: {
  order: Order;
  items: Array<{
    product_name?: string;
    product_brand?: string;
    product_image?: string;
    product_color?: string;
    quantity: number;
    price: number;
  }>;
}) {
  const primaryItem = getPrimaryOrderItem(items);
  const steps = getTrackingSteps(order);
  const completedSteps = steps.filter((step) => step.complete).length;
  const [visibleStepCount, setVisibleStepCount] = useState(0);

  useEffect(() => {
    setVisibleStepCount(0);
    if (completedSteps === 0) return;

    let nextStep = 0;
    const timer = window.setInterval(() => {
      nextStep += 1;
      setVisibleStepCount(nextStep);
      if (nextStep >= completedSteps) {
        window.clearInterval(timer);
      }
    }, 420);

    return () => window.clearInterval(timer);
  }, [completedSteps, order.id, order.status]);

  return (
    <div className="mt-5 border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3 text-[12px] text-slate-500">
        Order ID - <span className="font-semibold text-[#071225]">{displayOrderNumber(order)}</span>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#071225]">
            {primaryItem?.product_name || 'Shopore Order'}
          </p>
          {primaryItem?.product_color && <p className="mt-1 text-[12px] text-slate-500">{primaryItem.product_color}</p>}
          {primaryItem?.product_brand && <p className="mt-1 text-[12px] text-slate-500">Seller: {primaryItem.product_brand}</p>}
          <p className="mt-2 text-[18px] font-bold text-[#071225]">{formatPrice(order.total)}</p>
        </div>
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-slate-100">
          {primaryItem?.product_image ? (
            <Image src={primaryItem.product_image} alt={primaryItem.product_name || 'Order item'} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-slate-400">No image</div>
          )}
        </div>
      </div>

      <div className="px-4 py-5">
        <h3 className="mb-5 text-[14px] font-semibold">Track Order</h3>
        <div className="relative pl-8">
          {steps.map((step, index) => {
            const stepVisible = step.complete && index < visibleStepCount;
            const nextStepVisible = steps[index + 1]?.complete && index + 1 < visibleStepCount;

            return (
            <div key={`${order.id}-vertical-${step.label}`} className="relative pb-7 last:pb-0">
              {index !== steps.length - 1 && (
                <span className="absolute left-[-18px] top-4 h-full w-0.5 overflow-hidden bg-slate-200">
                  <span
                    className={`block h-full w-full origin-top bg-emerald-500 transition-transform duration-700 ease-out ${
                      nextStepVisible ? 'scale-y-100' : 'scale-y-0'
                    }`}
                  />
                </span>
              )}
              <span
                className={`absolute left-[-24px] top-1 h-3.5 w-3.5 rounded-full border transition-all duration-300 ${
                  stepVisible ? 'scale-110 border-emerald-500 bg-emerald-500' : 'scale-100 border-slate-300 bg-white'
                }`}
              />
              <p className={`text-[13px] font-bold transition-colors duration-300 ${stepVisible ? 'text-[#071225]' : 'text-slate-400'}`}>{step.label}</p>
              <p className="mt-1 text-[11px] text-slate-500">{step.date}</p>
              <p className="mt-2 text-[12px] leading-5 text-slate-600">{step.detail}</p>
            </div>
            );
          })}
        </div>
        {steps.at(-1)?.complete && !['cancelled', 'refund_processing', 'refunded'].includes(order.status) && (
          <p className="mt-4 rounded bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700">
            Order delivered successfully. Delivery confirmation mail is sent.
          </p>
        )}
      </div>
    </div>
  );
}
