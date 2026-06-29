'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CreditCard,
  HelpCircle,
  Mail,
  Package,
  Phone,
  CheckCircle2,
  AlertCircle,
  Camera,
  Save,
  X,
} from 'lucide-react';
import { apiFetch, getRefreshToken, getToken, getUser, saveAuth } from '@/lib/api';
import RoundLoader from '@/components/RoundLoader';
import { addNotification } from '@/lib/notifications';

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
  total: number;
  status: string;
  created_at: string;
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
      title: `Delivered on ${formatDate(order.created_at)}`,
      subtitle: 'Your item has been delivered',
      text: 'text-emerald-700',
    };
  }
  if (order.status === 'cancelled') {
    return {
      dot: 'bg-red-500',
      title: `Cancelled on ${formatDate(order.created_at)}`,
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
    return apiFetch(`/api/orders?user_id=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

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
    <main className="min-h-screen bg-[#f7f7f8] px-3 pb-16 pt-[104px] text-[#071225] sm:px-5 md:pt-[86px]">
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

      <div className="mx-auto w-full max-w-[1680px]">
        <div className="mb-8 text-center">
          <h1 className="text-[30px] font-semibold">My Account</h1>
          <p className="mt-2 text-[15px] text-slate-500">Manage your profile, orders and support</p>
        </div>

        <div className="grid gap-5 sm:gap-7 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
              <div className="relative mx-auto h-40 w-40 rounded-full">
                <button
                  type="button"
                  onClick={() => displayAvatarUrl && setPreviewAvatarOpen(true)}
                  className="relative block h-40 w-40 rounded-full focus:outline-none focus:ring-4 focus:ring-pink-100"
                  aria-label="Open profile photo"
                >
                  {displayAvatarUrl ? (
                    <Image
                      src={displayAvatarUrl}
                      alt="Profile photo"
                      fill
                      className="rounded-full border-4 border-pink-100 object-cover shadow-sm"
                      sizes="160px"
                    />
                  ) : (
                    <span className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-pink-100 bg-pink-100 text-[46px] font-semibold text-pink-600">
                      {firstName[0].toUpperCase()}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg transition hover:bg-pink-600"
                  aria-label="Choose profile photo"
                >
                  <Camera size={18} />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <div className="mt-5 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex h-10 items-center gap-2 rounded border border-slate-300 px-4 text-[13px] font-semibold text-[#071225] transition hover:border-pink-300 hover:bg-pink-50"
                  aria-label="Change profile photo"
                >
                  <Camera size={15} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={saveAvatar}
                  disabled={!pendingAvatarUrl}
                  className={`inline-flex h-10 items-center gap-2 rounded px-4 text-[13px] font-semibold text-white transition ${
                    pendingAvatarUrl ? 'bg-[#071225] hover:bg-[#111d31]' : 'cursor-not-allowed bg-slate-300'
                  }`}
                >
                  <Save size={15} />
                  Save
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              {[
                { id: 'profile' as const, label: 'My Profile', caption: 'Personal details', icon: '/user.png' },
                { id: 'orders' as const, label: 'My Orders', caption: 'Track purchases', icon: '/tracking.png' },
                { id: 'support' as const, label: 'Help & Support', caption: 'Get assistance', icon: '/support.png' },
              ].map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => changeTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-4 text-left transition ${active ? 'text-pink-600' : 'text-[#071225] hover:bg-slate-50'}`}
                  >
                    <img src={item.icon} alt="" className="h-[19px] w-[19px] object-contain" />
                    <span>
                      <span className="block text-[14px] font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-[12px] text-slate-500">{item.caption}</span>
                    </span>
                    {active && <span className="ml-auto text-[18px]">›</span>}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            {activeTab === 'profile' && (
              <div>
                <div className="mb-7 border-b border-slate-100 pb-5">
                  <h2 className="text-[20px] font-semibold">My Profile</h2>
                  <p className="mt-1 text-[13px] text-slate-500">Update your personal information</p>
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
                  <div className="flex h-11 border border-slate-300 bg-white">
                    <span className="flex w-16 items-center justify-center border-r border-slate-200 text-[13px]">+91</span>
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
                    className="h-11 w-full border border-slate-300 px-4 text-[14px] outline-none focus:border-[#071225]"
                  />
                  <p className="mt-2 text-[12px] text-slate-400">Avail birthday discounts as a member</p>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-[12px] font-semibold text-slate-700">Gender</p>
                  <div className="flex flex-wrap gap-8 text-[13px] text-slate-600">
                    {(['male', 'female', 'others'] as const).map((gender) => (
                      <label key={gender} className="flex cursor-pointer items-center gap-2 capitalize">
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
                  className={`mt-7 h-11 min-w-[190px] px-7 text-[14px] font-semibold text-white transition ${hasChanges && !savingProfile
                      ? 'bg-[#071225] hover:bg-[#111d31] cursor-pointer'
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
                <div className="mb-7 flex items-start justify-between border-b border-slate-100 pb-6">
                  <div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
                    <h2 className="text-[23px] font-semibold">My Orders</h2>
                    <p className="mt-1 text-[13px] text-slate-500">Orders update here after successful payment</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (user.id) {
                        setOrdersLoading(true);
                        apiFetch(`/api/orders?user_id=${encodeURIComponent(user.id)}`)
                          .then((res) => res.json())
                          .then((data) => Array.isArray(data) && setOrders(data))
                          .finally(() => setOrdersLoading(false));
                      }
                    }}
                    className="h-11 border border-slate-300 px-5 text-[13px] font-semibold transition hover:border-[#071225]"
                  >
                    Refresh
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-12">
                    <RoundLoader label="Loading your orders..." size={42} />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
                    <Package className="mx-auto text-slate-400" size={42} />
                    <h3 className="mt-4 text-[18px] font-semibold">No orders yet</h3>
                    <p className="mt-2 text-[14px] text-slate-500">After payment, your orders will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                            <p className="truncate text-[16px] font-semibold">{primaryItem?.product_name || `Order #${shortOrderId(order.id)}`}</p>
                            <p className="mt-2 text-[12px] text-slate-500">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-slate-500">
                              {primaryItem?.product_color && <span>Color: {primaryItem.product_color}</span>}
                              {primaryItem?.product_size && <span>Size: {primaryItem.product_size}</span>}
                              {primaryItem?.product_brand && <span>{primaryItem.product_brand}</span>}
                            </div>
                          </div>
                          <p className="text-[17px] font-bold md:text-right">{formatPrice(order.total)}</p>
                          <div>
                            <p className={`flex items-center gap-2 text-[14px] font-bold ${status.text}`}>
                              <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                              {status.title}
                            </p>
                            <p className="mt-2 text-[12px] text-slate-600">{status.subtitle}</p>
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
                <div className="mb-7 border-b border-slate-100 pb-5">
                  <h2 className="text-[20px] font-semibold">Help & Support</h2>
                  <p className="mt-1 text-[13px] text-slate-500">Choose a topic. We usually reply within 24 hours.</p>
                </div>

                <div className="space-y-3">
                  <SupportCard
                    id="orders"
                    open={openSupport === 'orders'}
                    icon={<Package size={22} />}
                    title="Order Issues"
                    subtitle="Track, cancel or return your order"
                    body="You can check order status in My Orders. For return or cancellation, keep your order ID ready so support can help faster."
                    onClick={() => setOpenSupport(openSupport === 'orders' ? null : 'orders')}
                  />
                  <SupportCard
                    id="payments"
                    open={openSupport === 'payments'}
                    icon={<CreditCard size={22} />}
                    title="Payment & Refunds"
                    subtitle="Payment failed, refund pending, or amount deducted"
                    body="If payment is deducted but order is not created, wait a few minutes and refresh My Orders. Refunds usually return to the original payment method based on bank timelines."
                    onClick={() => setOpenSupport(openSupport === 'payments' ? null : 'payments')}
                  />
                  <SupportCard
                    id="account"
                    open={openSupport === 'account'}
                    icon={<HelpCircle size={22} />}
                    title="Account Help"
                    subtitle="Login, profile and account details"
                    body="For login or profile issues, update your details here first. If the issue continues, contact support with your registered email."
                    onClick={() => setOpenSupport(openSupport === 'account' ? null : 'account')}
                  />
                  <Link
                    href="/contact"
                    className="flex items-center gap-4 rounded-xl border border-slate-200 p-5 text-[#071225] no-underline transition hover:border-pink-300 hover:bg-pink-50"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <Phone size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold">Contact Us</span>
                      <span className="mt-1 block text-[13px] text-slate-500">Go to contact page for direct support</span>
                    </span>
                    <Mail size={18} className="text-slate-400" />
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
      `}</style>
    </main>
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
        className={`h-11 w-full border border-slate-300 px-4 text-[14px] outline-none focus:border-[#071225] ${
          readOnly ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''
        }`}
      />
    </label>
  );
}

function SupportCard({
  icon,
  title,
  subtitle,
  body,
  open,
  onClick,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  body: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-slate-200 p-5 text-left transition hover:border-pink-300 hover:bg-pink-50"
    >
      <span className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{title}</span>
          <span className="mt-1 block text-[13px] text-slate-500">{subtitle}</span>
        </span>
        <span className="text-[20px] text-slate-400">{open ? '-' : '+'}</span>
      </span>
      {open && (
        <span className="mt-4 block border-t border-slate-100 pt-4 text-[13px] leading-6 text-slate-600">
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
        Order ID - <span className="font-semibold text-[#071225]">{shortOrderId(order.id)}</span>
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
