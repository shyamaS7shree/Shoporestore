'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, Home, Package, User, X } from 'lucide-react';
import { apiFetch, getUser } from '@/lib/api';
import { addNotification } from '@/lib/notifications';
import RoundLoader from '@/components/RoundLoader';

type StoredUser = {
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
};

type DeliveryAddress = {
  id?: string;
  full_name?: string;
  phone?: string;
  pin_code?: string;
  address_line?: string;
  city?: string;
  state?: string;
};

type Order = {
  id: string;
  order_number?: string;
  total: number;
  status: string;
  created_at: string;
  payment_id?: string;
  address_id?: string;
  delivery_address?: DeliveryAddress | null;
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

type TrackingStep = {
  label: string;
  date: string;
  targetAt: number;
  reached: boolean;
  lineProgress: number;
  detail: string;
};

const ORDER_SNAPSHOT_KEY = 'shopore-order-snapshots';
const ORDER_ADDRESS_SNAPSHOT_KEY = 'shopore-order-addresses';
const RETURN_REQUEST_KEY = 'shopore-return-requests';
const PROFILE_EXTRA_KEY = 'shopore_profile_extra';
const INDIA_TIME_ZONE = 'Asia/Kolkata';
const TRACKING_DURATION_MS = 2 * 24 * 60 * 60 * 1000;
const CANCEL_REASONS = [
  'Ordered by mistake',
  'Size or fit issue',
  'Product no longer needed',
  'Found a better price',
  'Delivery is taking too long',
];
const RETURN_REASONS = [
  'Size or fit issue',
  'Wrong item received',
  'Product damaged',
  'Quality not as expected',
  'Product no longer needed',
];

function userScopedKey(baseKey: string, user?: StoredUser | null) {
  const userKey = user?.id || user?.email;
  return userKey ? `${baseKey}:${userKey}` : baseKey;
}

type ReturnRequest = {
  orderId: string;
  userId: string;
  reason: string;
  note?: string;
  requestedAt: string;
};

function formatPrice(value: number) {
  return `\u20b9${Number(value || 0).toLocaleString('en-IN')}.00`;
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

function addHoursDateTime(value: string, hours: number) {
  const date = parseOrderDate(value);
  date.setHours(date.getHours() + hours);
  return formatDateTime(date.toISOString());
}

function daysSince(value: string) {
  const created = parseOrderDate(value).getTime();
  return Math.floor((Date.now() - created) / (24 * 60 * 60 * 1000));
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

function getPaymentLabel(order: Order) {
  if (order.payment_id || ['paid', 'refund_processing', 'refunded'].includes(order.status)) {
    return 'UPI';
  }
  if (['cod', 'cancelled', 'delivered'].includes(order.status)) return 'Cash On Delivery';
  if (order.status === 'pay_later') return 'Pay Later';
  return 'Payment Pending';
}

function getStatusTone(status: string) {
  if (['cancelled', 'refund_processing', 'refunded'].includes(status)) {
    return { dot: 'bg-red-500', text: 'text-red-600', panel: 'bg-red-50 text-red-700' };
  }
  if (status === 'delivered') {
    return { dot: 'bg-emerald-600', text: 'text-emerald-700', panel: 'bg-emerald-50 text-emerald-700' };
  }
  return { dot: 'bg-emerald-500', text: 'text-[#071225]', panel: 'bg-emerald-50 text-emerald-700' };
}

function canCancelOrder(order?: Order | null) {
  if (!order) return false;
  if (['cancelled', 'refund_processing', 'refunded', 'delivered'].includes(order.status)) return false;
  return Date.now() - parseOrderDate(order.created_at).getTime() < 24 * 60 * 60 * 1000;
}

function getCancelUnavailableMessage(order?: Order | null) {
  if (!order) return 'Cancellation is not available for this order.';
  if (order.status === 'cancelled') return 'This order is already cancelled.';
  if (order.status === 'refund_processing') return 'This paid order is already cancelled and refund processing has started.';
  if (order.status === 'refunded') return 'This order is already refunded and closed.';
  if (order.status === 'delivered') return 'This order is delivered. You can request a return if the item is eligible.';

  return 'This order has shipped, so cancellation is no longer available. You can request a return after delivery if the item is eligible.';
}

function getReturnRequests() {
  try {
    const data = JSON.parse(localStorage.getItem(RETURN_REQUEST_KEY) || '[]');
    return Array.isArray(data) ? data as ReturnRequest[] : [];
  } catch {
    return [];
  }
}

function saveReturnRequests(requests: ReturnRequest[]) {
  localStorage.setItem(RETURN_REQUEST_KEY, JSON.stringify(requests));
}

function getReturnRequest(orderId?: string, userId?: string) {
  if (!orderId || !userId || typeof window === 'undefined') return null;
  return getReturnRequests().find((request) => request.orderId === orderId && request.userId === userId) || null;
}

function canReturnOrder(order?: Order | null, returnRequest?: ReturnRequest | null) {
  if (!order || returnRequest) return false;
  return order.status === 'delivered' && daysSince(order.created_at) <= 9;
}

function progressBetween(now: number, start: number, end: number) {
  if (end <= start) return 100;
  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
}

function buildSteps(
  baseSteps: Array<Omit<TrackingStep, 'reached' | 'lineProgress'>>,
  now: number,
  forceCompleteFromIndex = -1
): TrackingStep[] {
  return baseSteps.map((step, index) => {
    const nextStep = baseSteps[index + 1];
    const reached = index <= forceCompleteFromIndex || now >= step.targetAt;
    const nextReached = nextStep ? now >= nextStep.targetAt || index + 1 <= forceCompleteFromIndex : reached;

    return {
      ...step,
      reached,
      lineProgress: nextStep ? (nextReached ? 100 : progressBetween(now, step.targetAt, nextStep.targetAt)) : 0,
    };
  });
}

function getTrackingSteps(order: Order, now: number): TrackingStep[] {
  const cancelled = ['cancelled', 'refund_processing', 'refunded'].includes(order.status);
  const delivered = order.status === 'delivered';
  const createdAt = order.created_at;
  const createdTime = parseOrderDate(createdAt).getTime();

  if (cancelled) {
    const steps = [
      { label: 'Order placed', date: formatDateTime(createdAt), targetAt: createdTime, detail: 'Your order was placed.' },
      { label: 'Cancellation requested', date: formatDateTime(createdAt), targetAt: createdTime, detail: 'Cancellation request received.' },
      {
        label: order.status === 'refunded' ? 'Refund successful' : 'Refund update',
        date: addHoursDateTime(createdAt, 24),
        targetAt: createdTime + TRACKING_DURATION_MS / 2,
        detail: order.status === 'refunded' ? 'Refund successfully processed.' : 'Refund is being processed.',
      },
      {
        label: 'Order closed',
        date: addHoursDateTime(createdAt, 48),
        targetAt: createdTime + TRACKING_DURATION_MS,
        detail: order.status === 'refunded' ? 'This order is closed.' : 'Order will close after refund confirmation.',
      },
    ];

    return buildSteps(steps, now, order.status === 'refunded' ? steps.length - 1 : 1);
  }

  const steps = [
    { label: 'Ordered', date: formatDateTime(createdAt), targetAt: createdTime, detail: 'Your order has been placed.' },
    { label: 'Packed', date: addHoursDateTime(createdAt, 12), targetAt: createdTime + TRACKING_DURATION_MS * 0.25, detail: 'Seller has processed your order.' },
    { label: 'Shipped', date: addHoursDateTime(createdAt, 24), targetAt: createdTime + TRACKING_DURATION_MS * 0.5, detail: 'Your item has been picked up by courier partner.' },
    { label: 'Out for delivery', date: addHoursDateTime(createdAt, 36), targetAt: createdTime + TRACKING_DURATION_MS * 0.75, detail: 'Shipment is close to your delivery address.' },
    { label: 'Delivered', date: addHoursDateTime(createdAt, 48), targetAt: createdTime + TRACKING_DURATION_MS, detail: 'Order delivered successfully.' },
  ];

  return buildSteps(steps, now, delivered ? steps.length - 1 : -1);
}

function getReturnSteps(returnRequest: ReturnRequest, now: number): TrackingStep[] {
  const requestedAt = returnRequest.requestedAt;
  const requestedTime = parseOrderDate(requestedAt).getTime();
  const steps = [
    { label: 'Return requested', date: formatDateTime(requestedAt), targetAt: requestedTime, detail: 'Your return request has been received.' },
    { label: 'Pickup review', date: addHoursDateTime(requestedAt, 12), targetAt: requestedTime + TRACKING_DURATION_MS * 0.25, detail: 'We are reviewing pickup and product details.' },
    { label: 'Item pickup', date: addHoursDateTime(requestedAt, 24), targetAt: requestedTime + TRACKING_DURATION_MS * 0.5, detail: 'Return pickup is being processed.' },
    { label: 'Refund processing', date: addHoursDateTime(requestedAt, 36), targetAt: requestedTime + TRACKING_DURATION_MS * 0.75, detail: 'Refund will start after return verification.' },
    { label: 'Return completed', date: addHoursDateTime(requestedAt, 48), targetAt: requestedTime + TRACKING_DURATION_MS, detail: 'Return and refund process is complete.' },
  ];

  return buildSteps(steps, now);
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

function getDisplayItems(
  order: Order | null,
  snapshots: Record<string, OrderSnapshotItem[]>,
  productImagesById: ProductImageLookup
) {
  if (!order) return [];
  const snapshotItems = snapshots[order.id] || [];
  const dbItems = order.order_items || [];

  if (dbItems.length > 0) {
    return dbItems.map((item, index) => {
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
    });
  }

  return snapshotItems.map((item, index) => ({
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
}

function getPriceDetails(order: Order, items: ReturnType<typeof getDisplayItems>) {
  const sellingTotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const listingTotal = Math.max(sellingTotal, Math.round(sellingTotal * 1.25));
  const codFee = getPaymentLabel(order) === 'Cash On Delivery' ? 30 : 0;
  const storedFee = Math.max(Number(order.total || 0) - sellingTotal, 0);
  const totalFees = Math.max(codFee, storedFee);
  const totalAmount = Math.max(Number(order.total || 0), sellingTotal + totalFees);

  return {
    listingTotal,
    sellingTotal,
    discountTotal: Math.max(listingTotal - sellingTotal, 0),
    totalFees,
    totalAmount,
  };
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [profilePhone, setProfilePhone] = useState('');
  const [orderAddressSnapshots, setOrderAddressSnapshots] = useState<Record<string, DeliveryAddress>>({});
  const [fallbackAddress, setFallbackAddress] = useState<DeliveryAddress | null>(null);
  const [snapshots, setSnapshots] = useState<Record<string, OrderSnapshotItem[]>>({});
  const [productImagesById, setProductImagesById] = useState<ProductImageLookup>({});
  const [productImagesLoaded, setProductImagesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [selectedReturnReason, setSelectedReturnReason] = useState('');
  const [returnNote, setReturnNote] = useState('');
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
  const [cancelledAt, setCancelledAt] = useState('');
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState('');
  const [now, setNow] = useState(() => Date.now());

  const displayItems = useMemo(() => getDisplayItems(order, snapshots, productImagesById), [order, snapshots, productImagesById]);
  const steps = order ? getTrackingSteps(order, now) : [];
  const returnSteps = returnRequest ? getReturnSteps(returnRequest, now) : [];
  const priceDetails = order ? getPriceDetails(order, displayItems) : null;
  const paymentLabel = order ? getPaymentLabel(order) : '';
  const statusTone = order ? getStatusTone(order.status) : getStatusTone('');
  const deliveryAddress = (order ? orderAddressSnapshots[order.id] : null) || order?.delivery_address || fallbackAddress;
  const customerName = deliveryAddress?.full_name || user?.fullName || user?.name || 'Shopore customer';
  const customerPhone = deliveryAddress?.phone || profilePhone || user?.phone || 'Phone not available';
  const addressLine = deliveryAddress
    ? [deliveryAddress.address_line, deliveryAddress.city, deliveryAddress.state, deliveryAddress.pin_code].filter(Boolean).join(', ')
    : 'Delivery address not available for this older order.';

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (productImagesLoaded) return;

    loadProductImageLookup()
      .then((lookup) => {
        setProductImagesById(lookup);
        setProductImagesLoaded(true);
      })
      .catch(() => {
        setProductImagesById({});
        setProductImagesLoaded(true);
      });
  }, [productImagesLoaded]);

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    const extra = storedUser ? JSON.parse(localStorage.getItem(userScopedKey(PROFILE_EXTRA_KEY, storedUser)) || '{}') : {};
    setProfilePhone(storedUser?.phone || extra.phone || '');
    setSnapshots(JSON.parse(localStorage.getItem(ORDER_SNAPSHOT_KEY) || '{}'));
    setOrderAddressSnapshots(JSON.parse(localStorage.getItem(ORDER_ADDRESS_SNAPSHOT_KEY) || '{}'));
    setReturnRequest(getReturnRequest(params.id, storedUser?.id));

    if (!storedUser?.id) {
      setLoading(false);
      return;
    }

    apiFetch(`/api/profile?user_id=${encodeURIComponent(storedUser.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (profile?.phone) setProfilePhone(profile.phone);
      })
      .catch(() => {});

    apiFetch(`/api/addresses?user_id=${encodeURIComponent(storedUser.id)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((addresses) => {
        if (Array.isArray(addresses) && addresses[0]) {
          setFallbackAddress(addresses[0]);
        }
      })
      .catch(() => {});

    apiFetch(`/api/orders?user_id=${encodeURIComponent(storedUser.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setError('Could not load orders.');
          return;
        }

        const foundOrder = data.find((item: Order) => item.id === params.id);
        if (!foundOrder) {
          setError('Order not found.');
          return;
        }

        setOrder(foundOrder);
      })
      .catch(() => setError('Could not load order details.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const cancelOrder = async () => {
    if (!user?.id || !order || cancelling) return;

    const reason = selectedReason === 'Other' ? customReason.trim() : selectedReason;
    if (!reason) {
      setError('Please select a cancellation reason.');
      return;
    }

    setCancelling(true);
    setError('');

    try {
      const response = await apiFetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          user_id: user.id,
          user_email: user.email,
          user_name: user.fullName || user.name || user.email,
          cancellation_reason: reason,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Order cancellation failed');
      }

      setOrder((previous) => ({ ...result.order, delivery_address: result.order?.delivery_address || previous?.delivery_address || null }));
      const now = new Date().toISOString();
      setCancelledAt(now);
      setCancelSuccessMessage(
        result.order?.status === 'refund_processing'
          ? 'Order cancelled successfully. Refund processing has started.'
          : 'Order cancelled successfully. No shipment will happen.'
      );
      setCancelOpen(false);
      addNotification({
        userId: user.id,
        type: result.order?.status === 'refund_processing' ? 'refund' : 'cancel',
        title: result.order?.status === 'refund_processing' ? 'Refund processing started' : 'Order cancelled',
        message:
          result.order?.status === 'refund_processing'
            ? `Order ${shortOrderId(order.id)} is cancelled. Refund processing has started. Reason: ${reason}.`
            : `Order ${shortOrderId(order.id)} was cancelled successfully. Reason: ${reason}.`,
        href: `/profile/orders/${order.id}`,
      });
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Order cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const submitReturnRequest = () => {
    if (!user?.id || !order || returning) return;

    const reason = selectedReturnReason === 'Other' ? returnNote.trim() : selectedReturnReason;
    if (!reason) {
      setError('Please select a return reason.');
      return;
    }

    setReturning(true);
    setError('');

    const nextRequest: ReturnRequest = {
      orderId: order.id,
      userId: user.id,
      reason,
      note: returnNote.trim(),
      requestedAt: new Date().toISOString(),
    };

    const otherRequests = getReturnRequests().filter(
      (request) => !(request.orderId === order.id && request.userId === user.id)
    );
    saveReturnRequests([nextRequest, ...otherRequests]);
    setReturnRequest(nextRequest);
    setReturnOpen(false);
    addNotification({
      userId: user.id,
      type: 'refund',
      title: 'Return requested',
      message: `Return request for order ${shortOrderId(order.id)} was submitted. Reason: ${reason}.`,
      href: `/profile/orders/${order.id}`,
    });
    setReturning(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] px-4 pt-[140px]">
        <RoundLoader label="Loading order details..." size={44} />
      </main>
    );
  }

  if (!user?.id) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] px-4 pb-16 pt-[140px] text-center text-[#071225]">
        <Package className="mx-auto text-slate-400" size={44} />
        <h1 className="mt-4 text-[24px] font-semibold">Please login first</h1>
        <p className="mt-2 text-[14px] text-slate-500">Login to view order details.</p>
        <Link href="/" className="mt-7 inline-flex h-11 items-center justify-center rounded bg-[#071225] px-7 text-[14px] font-semibold text-white">
          Go Home
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] px-4 pb-16 pt-[140px] text-center text-[#071225]">
        <AlertCircle className="mx-auto text-red-400" size={44} />
        <h1 className="mt-4 text-[24px] font-semibold">{error || 'Order not found'}</h1>
        <button
          type="button"
          onClick={() => router.push('/profile?section=orders')}
          className="mt-7 inline-flex h-11 items-center justify-center rounded bg-[#071225] px-7 text-[14px] font-semibold text-white"
        >
          Back To Orders
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-5 pb-16 pt-[104px] text-[#071225] sm:px-8 md:pt-[86px] lg:px-12">
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="mb-6 grid items-center gap-4 sm:grid-cols-[180px_1fr_180px]">
          <div className="hidden sm:block" />
          <h1 className="text-center text-[30px] font-semibold">Order Details</h1>
          <Link
            href="/profile?section=orders"
            className="inline-flex h-11 items-center justify-center gap-2 justify-self-center border border-slate-300 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-[#071225] hover:text-[#071225] sm:justify-self-end"
          >
            <ArrowLeft size={16} />
            Back to My Orders
          </Link>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Order Details</p>
              <h1 className="mt-4 text-[19px] font-normal">Order ID # {displayOrderNumber(order)}</h1>
              <p className="mt-2 text-[13px] text-slate-500">Placed on {formatDateTime(order.created_at)}</p>
              {cancelledAt && (
                <p className="mt-2 text-[12px] font-semibold text-red-600">
                  Cancelled on {formatDateTime(cancelledAt)}
                </p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${statusTone.panel}`}>
                {getOrderStatusLabel(order.status)}
              </span>
              <p className="mt-3 text-[20px] font-bold">{formatPrice(priceDetails?.totalAmount || order.total)}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 px-6">
            {displayItems.map((item) => (
              <div key={item.id} className="flex gap-5 py-6">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded bg-slate-100">
                  {item.product_image ? (
                    <Image src={item.product_image} alt={item.product_name || 'Ordered product'} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">No image</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold text-[#071225]">{item.product_name || 'Product details unavailable'}</p>
                  {item.product_brand && <p className="mt-1 text-[13px] text-slate-500">{item.product_brand}</p>}
                  <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-slate-500">
                    {item.product_color && <span>Color: {item.product_color}</span>}
                    {item.product_size && <span>Size: {item.product_size}</span>}
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>
                <p className="shrink-0 text-[14px] font-bold">{formatPrice(Number(item.price) * Number(item.quantity || 1))}</p>
              </div>
            ))}
            {displayItems.length === 0 && (
              <p className="py-5 text-[13px] text-slate-500">This older order was saved before item details were enabled.</p>
            )}
          </div>

          <div className="grid items-start gap-5 border-t border-slate-100 bg-[#f8fafc] p-6 xl:grid-cols-[minmax(0,1fr)_460px]">
            <div className="rounded-lg bg-white p-5">
              <h2 className="text-[18px] font-bold">Delivery details</h2>
              <div className="mt-4 rounded-xl bg-slate-50 p-5">
                <div className="flex gap-3 border-b border-slate-200 pb-3">
                  <Home size={16} className="mt-0.5 shrink-0 text-slate-500" />
                  <p className="line-clamp-2 text-[12px] leading-5 text-[#071225]">{addressLine}</p>
                </div>
                <div className="mt-3 flex gap-3">
                  <User size={16} className="mt-0.5 shrink-0 text-slate-500" />
                  <p className="text-[12px] leading-5 text-slate-600">
                    <span className="font-bold text-[#071225]">{customerName}</span>
                    <span className="ml-2">{customerPhone}</span>
                  </p>
                </div>
              </div>
            </div>

            {priceDetails && (
              <div className="rounded-lg bg-white p-5">
                <h2 className="text-[18px] font-bold">Price details</h2>
                <div className="mt-4 rounded-xl border border-slate-200 p-4 text-[13px]">
                  <PriceRow label="Listing price" value={formatPrice(priceDetails.listingTotal)} strike />
                  <PriceRow label="Selling price" value={formatPrice(priceDetails.sellingTotal)} />
                  <PriceRow label={paymentLabel === 'Cash On Delivery' ? 'COD delivery charge' : 'Total fees'} value={formatPrice(priceDetails.totalFees)} />
                  {priceDetails.discountTotal > 0 && (
                    <PriceRow label="Other discount" value={`-${formatPrice(priceDetails.discountTotal)}`} valueClass="text-emerald-600" />
                  )}
                  <div className="my-4 border-t border-dashed border-slate-300" />
                  <PriceRow label="Total amount" value={formatPrice(priceDetails.totalAmount)} strong />
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-3">
                    <span className="text-[12px] text-slate-600">Paid By</span>
                    <span className="inline-flex items-center gap-2 text-[12px] font-bold text-[#071225]">
                      <CreditCard size={14} />
                      {paymentLabel}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-[19px] font-bold">Track Order</h2>
            <div className="mt-6 pl-8">
              {steps.map((step, index) => (
                <div key={`${step.label}-${index}`} className="relative pb-7 last:pb-0">
                  {index !== steps.length - 1 && (
                    <span className="absolute left-[-18px] top-4 h-full w-0.5 overflow-hidden bg-slate-200">
                      <span
                        className="block w-full origin-top bg-emerald-500 transition-[height] duration-700 ease-out"
                        style={{ height: `${step.lineProgress}%` }}
                      />
                    </span>
                  )}
                  <span className={`absolute left-[-24px] top-1 h-3.5 w-3.5 rounded-full border ${
                    step.reached ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'
                  }`} />
                  <p className={`text-[13px] font-bold ${step.reached ? 'text-[#071225]' : 'text-slate-400'}`}>{step.label}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{step.date}</p>
                  <p className="mt-2 text-[12px] leading-5 text-slate-600">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="self-start rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-[19px] font-bold">Order Actions</h2>
            <p className="mt-2 text-[13px] leading-5 text-slate-500">
              Manage cancellation and refund from this order page.
            </p>

            {error && (
              <div className="mt-4 flex gap-2 rounded border border-red-100 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            {cancelSuccessMessage && (
              <div className="mt-4 flex gap-2 rounded border border-emerald-100 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700">
                <CheckCircle2 size={15} />
                {cancelSuccessMessage}
              </div>
            )}

            {order.status === 'refunded' && (
              <div className="mt-4 flex gap-2 rounded border border-emerald-100 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700">
                <CheckCircle2 size={15} />
                Refund successfully processed.
              </div>
            )}

            {returnRequest && (
              <div className="mt-4 rounded border border-pink-100 bg-pink-50 px-3 py-3 text-[12px] text-pink-700">
                <p className="font-bold">Return request submitted</p>
                <p className="mt-1 leading-5">Reason: {returnRequest.reason}</p>
                <p className="mt-1 text-pink-500">Requested on {formatDateTime(returnRequest.requestedAt)}</p>
              </div>
            )}

            {canCancelOrder(order) ? (
              <>
                {!cancelOpen ? (
                  <button
                    type="button"
                    onClick={() => setCancelOpen(true)}
                    className="mt-5 h-11 w-full border border-red-200 text-[13px] font-bold text-red-600 transition hover:bg-red-50"
                  >
                    {order.status === 'paid' ? 'Cancel Order & Start Refund' : 'Cancel Order'}
                  </button>
                ) : (
                  <div className="mt-5 border border-red-100 bg-red-50/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[14px] font-bold">Why are you cancelling?</h3>
                      <button type="button" onClick={() => setCancelOpen(false)} aria-label="Close cancellation reasons">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {CANCEL_REASONS.map((reason) => (
                        <label key={reason} className="flex cursor-pointer items-start gap-2 text-[13px] text-slate-700">
                          <input
                            type="radio"
                            name="cancel_reason"
                            checked={selectedReason === reason}
                            onChange={() => setSelectedReason(reason)}
                            className="mt-0.5 h-4 w-4 accent-[#071225]"
                          />
                          {reason}
                        </label>
                      ))}
                      <label className="flex cursor-pointer items-start gap-2 text-[13px] text-slate-700">
                        <input
                          type="radio"
                          name="cancel_reason"
                          checked={selectedReason === 'Other'}
                          onChange={() => setSelectedReason('Other')}
                          className="mt-0.5 h-4 w-4 accent-[#071225]"
                        />
                        Other reason
                      </label>
                      {selectedReason === 'Other' && (
                        <textarea
                          value={customReason}
                          onChange={(event) => setCustomReason(event.target.value)}
                          placeholder="Write your reason"
                          className="min-h-[82px] w-full resize-none border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#071225]"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={cancelOrder}
                      disabled={cancelling}
                      className="mt-4 h-11 w-full bg-red-600 text-[13px] font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cancelling ? 'Cancelling...' : order.status === 'paid' ? 'Confirm Cancel & Refund' : 'Confirm Cancel'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-5 rounded bg-slate-50 px-3 py-3 text-[13px] font-semibold text-slate-600">
                {getCancelUnavailableMessage(order)}
              </p>
            )}

            {canReturnOrder(order, returnRequest) && (
              <>
                {!returnOpen ? (
                  <button
                    type="button"
                    onClick={() => {
                      setReturnOpen(true);
                      setCancelOpen(false);
                      setError('');
                    }}
                    className="mt-3 h-11 w-full border border-pink-200 text-[13px] font-bold text-pink-600 transition hover:bg-pink-50"
                  >
                    Return Product
                  </button>
                ) : (
                  <div className="mt-5 border border-pink-100 bg-pink-50/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[14px] font-bold">Why are you returning?</h3>
                      <button type="button" onClick={() => setReturnOpen(false)} aria-label="Close return reasons">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="mt-2 text-[12px] leading-5 text-slate-500">
                      Returns are accepted within 7 days of delivery for unused items with tags and packaging.
                    </p>
                    <div className="mt-4 space-y-3">
                      {RETURN_REASONS.map((reason) => (
                        <label key={reason} className="flex cursor-pointer items-start gap-2 text-[13px] text-slate-700">
                          <input
                            type="radio"
                            name="return_reason"
                            checked={selectedReturnReason === reason}
                            onChange={() => setSelectedReturnReason(reason)}
                            className="mt-0.5 h-4 w-4 accent-[#071225]"
                          />
                          {reason}
                        </label>
                      ))}
                      <label className="flex cursor-pointer items-start gap-2 text-[13px] text-slate-700">
                        <input
                          type="radio"
                          name="return_reason"
                          checked={selectedReturnReason === 'Other'}
                          onChange={() => setSelectedReturnReason('Other')}
                          className="mt-0.5 h-4 w-4 accent-[#071225]"
                        />
                        Other reason
                      </label>
                      <textarea
                        value={returnNote}
                        onChange={(event) => setReturnNote(event.target.value)}
                        placeholder={selectedReturnReason === 'Other' ? 'Write your return reason' : 'Add note or size issue details'}
                        className="min-h-[82px] w-full resize-none border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#071225]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={submitReturnRequest}
                      disabled={returning}
                      className="mt-4 h-11 w-full bg-pink-600 text-[13px] font-bold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {returning ? 'Submitting...' : 'Submit Return Request'}
                    </button>
                  </div>
                )}
              </>
            )}
          </aside>
        </section>

        {returnRequest && (
          <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-[17px] font-bold">Return Progress</h2>
            <div className="mt-6 pl-8">
              {returnSteps.map((step, index) => (
                <div key={`${step.label}-${index}`} className="relative pb-7 last:pb-0">
                  {index !== returnSteps.length - 1 && (
                    <span className="absolute left-[-18px] top-4 h-full w-0.5 overflow-hidden bg-slate-200">
                      <span
                        className="block w-full origin-top bg-pink-500 transition-[height] duration-700 ease-out"
                        style={{ height: `${step.lineProgress}%` }}
                      />
                    </span>
                  )}
                  <span className={`absolute left-[-24px] top-1 h-3.5 w-3.5 rounded-full border ${
                    step.reached ? 'border-pink-500 bg-pink-500' : 'border-slate-300 bg-white'
                  }`} />
                  <p className={`text-[13px] font-bold ${step.reached ? 'text-[#071225]' : 'text-slate-400'}`}>{step.label}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{step.date}</p>
                  <p className="mt-2 text-[12px] leading-5 text-slate-600">{step.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function PriceRow({
  label,
  value,
  strong = false,
  strike = false,
  valueClass = '',
}: {
  label: string;
  value: string;
  strong?: boolean;
  strike?: boolean;
  valueClass?: string;
}) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-4 last:mb-0 ${strong ? 'font-bold' : ''}`}>
      <span className="text-slate-600">{label}</span>
      <span className={`${strike ? 'text-slate-500 line-through' : 'text-[#071225]'} ${valueClass}`}>{value}</span>
    </div>
  );
}
