'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronRight,
  Info,
  Minus,
  Plus,
  Ticket,
  Trash2,
  MapPin,
  X,
} from 'lucide-react';
import {
  CartItem,
  getCartEventName,
  readCart,
  removeCartItem,
  updateCartQuantity,
  writeCart,
} from '@/lib/cart';
import { apiFetch, getUser } from '@/lib/api';
import AuthModal from '@/components/AuthModal';
import RoundLoader from '@/components/RoundLoader';
import {
  DeliveryLocation,
  getDeliveryLocationEventName,
  readDeliveryLocation,
  saveDeliveryLocation,
} from '@/lib/deliveryLocation';
import { addNotification } from '@/lib/notifications';

type SavedAddress = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  pin_code: string;
  address_line: string;
  city: string;
  state: string;
};

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type GooglePaymentData = {
  paymentMethodData?: {
    tokenizationData?: {
      token?: string;
    };
  };
};

type CheckoutStep = 'bag' | 'address' | 'payment';
type PaymentMethod = 'gpay' | 'card' | 'cod';
const CONTINUE_SHOPPING_HREF = '/genz/fashion';
const ORDER_SNAPSHOT_KEY = 'shopore-order-snapshots';
const ORDER_ADDRESS_SNAPSHOT_KEY = 'shopore-order-addresses';
const GOOGLE_PAY_SCRIPT_ID = 'google-pay-js';
const GOOGLE_PAY_SCRIPT_SRC = 'https://pay.google.com/gp/p/js/pay.js';
const PAYMENT_METHODS: {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: string;
  iconAlt: string;
}[] = [
  {
    id: 'gpay',
    title: 'Google Pay',
    subtitle: 'Pay directly with Google Pay / UPI.',
    icon: '/google-pay.png',
    iconAlt: 'Google Pay',
  },
  {
    id: 'card',
    title: 'Credit Card',
    subtitle: 'Enter card details before checkout.',
    icon: '/credit-card.png',
    iconAlt: 'Credit card',
  },
  {
    id: 'cod',
    title: 'Cash On Delivery',
    subtitle: 'Pay in cash when the order reaches your address.',
    icon: '/cash-on-delivery.png',
    iconAlt: 'Cash on delivery',
  },
];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
    google?: {
      payments?: {
        api?: {
          PaymentsClient: new (options: Record<string, unknown>) => {
            loadPaymentData: (request: Record<string, unknown>) => Promise<GooglePaymentData>;
          };
        };
      };
    };
  }
}

let googlePayScriptLoadPromise: Promise<void> | null = null;

function formatPrice(value: number) {
  return `\u20b9${value.toLocaleString('en-IN')}.00`;
}

function buildCartProductHref(product: CartItem['product']) {
  const params = new URLSearchParams({
    brand: product.brand,
    name: product.name,
    description: product.name,
    image: product.image,
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    size: product.size || '',
    color: product.color || '',
  });

  return `/products/${encodeURIComponent(product.id)}?${params.toString()}`;
}

function saveOrderCheckoutSnapshot(orderId: string, items: unknown[], address: SavedAddress) {
  const rawSnapshots = localStorage.getItem(ORDER_SNAPSHOT_KEY);
  const snapshots = rawSnapshots ? JSON.parse(rawSnapshots) : {};
  snapshots[orderId] = items;
  localStorage.setItem(ORDER_SNAPSHOT_KEY, JSON.stringify(snapshots));

  const rawAddresses = localStorage.getItem(ORDER_ADDRESS_SNAPSHOT_KEY);
  const addressSnapshots = rawAddresses ? JSON.parse(rawAddresses) : {};
  addressSnapshots[orderId] = address;
  localStorage.setItem(ORDER_ADDRESS_SNAPSHOT_KEY, JSON.stringify(addressSnapshots));
}

function loadGooglePayScript() {
  if (window.google?.payments?.api?.PaymentsClient) {
    return Promise.resolve();
  }

  if (googlePayScriptLoadPromise) {
    return googlePayScriptLoadPromise;
  }

  googlePayScriptLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_PAY_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existingScript || document.createElement('script');

    script.id = GOOGLE_PAY_SCRIPT_ID;
    script.src = GOOGLE_PAY_SCRIPT_SRC;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => {
      googlePayScriptLoadPromise = null;
      reject(new Error('Google Pay script failed to load. Check your internet connection and try again.'));
    };

    if (!existingScript) {
      document.head.appendChild(script);
    }
  });

  return googlePayScriptLoadPromise;
}

async function loadGooglePayTestPayment(amount: number) {
  await loadGooglePayScript();

  if (!window.google?.payments?.api?.PaymentsClient) {
    throw new Error('Google Pay is not available in this browser. Please try Chrome or Edge.');
  }

  const paymentsClient = new window.google.payments.api.PaymentsClient({
    environment: 'TEST',
  });

  return paymentsClient.loadPaymentData({
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId',
          },
        },
      },
    ],
    merchantInfo: {
      merchantName: 'SHOPORE',
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: amount.toFixed(2),
      currencyCode: 'INR',
      countryCode: 'IN',
    },
  });
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('bag');
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null);
  const [paymentSuccessOrderId, setPaymentSuccessOrderId] = useState<string | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [modalPinCode, setModalPinCode] = useState('');
  const [modalPinLoading, setModalPinLoading] = useState(false);
  const [modalPinError, setModalPinError] = useState('');
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    pin_code: '',
    address_line: '',
    city: '',
    state: '',
  });

  const refreshCart = () => setCartItems(readCart());

  const loadSavedAddresses = async (openModal = false, showForm = false) => {
    const user = getUser();
    if (!user?.id) {
      if (openModal) openLoginModal();
      return;
    }

    if (openModal) {
      setAddressLoading(true);
      applyDeliveryLocationToForm(readDeliveryLocation());
    }

    try {
      const res = await apiFetch(`/api/addresses?user_id=${encodeURIComponent(user.id)}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setAddresses(data);
        setSelectedAddress((current) => current || data[0] || null);

        if (openModal) {
          setShowAddressForm(showForm || data.length === 0);
        }
      }
    } finally {
      if (openModal) {
        setAddressLoading(false);
        setAddressModalOpen(true);
      }
    }
  };

  const applyDeliveryLocationToForm = (location: DeliveryLocation | null) => {
    if (!location) return;

    const user = getUser();
    setModalPinCode(location.pin);
    setAddressForm((prev) => ({
      ...prev,
      full_name: prev.full_name || user?.fullName || user?.name || '',
      phone: prev.phone || user?.phone || '',
      pin_code: location.pin,
      address_line: location.name,
      city: location.district,
      state: location.state,
    }));
  };

  useEffect(() => {
    refreshCart();
    loadSavedAddresses();
    window.addEventListener(getCartEventName(), refreshCart);

    return () => window.removeEventListener(getCartEventName(), refreshCart);
  }, []);

  useEffect(() => {
    if (paymentSuccessOrderId) {
      router.prefetch('/profile?section=orders');
    }
  }, [paymentSuccessOrderId, router]);

  useEffect(() => {
    const syncDeliveryLocation = () => {
      const location = readDeliveryLocation();
      setDeliveryLocation(location);
      applyDeliveryLocationToForm(location);
    };

    syncDeliveryLocation();
    window.addEventListener(getDeliveryLocationEventName(), syncDeliveryLocation);
    window.addEventListener('storage', syncDeliveryLocation);

    return () => {
      window.removeEventListener(getDeliveryLocationEventName(), syncDeliveryLocation);
      window.removeEventListener('storage', syncDeliveryLocation);
    };
  }, []);

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity < 1) return;

    setCartItems(updateCartQuantity(key, quantity));
  };

  const updateItemSize = (key: string, size: string) => {
    const nextItems = cartItems.map((item) =>
      item.key === key ? { ...item, product: { ...item.product, size } } : item
    );
    writeCart(nextItems);
    setCartItems(nextItems);
  };

  const removeItem = (key: string) => {
    setCartItems(removeCartItem(key));
    setPendingDeleteKey(null);
  };

  const openLoginModal = () => {
    setAuthModalOpen(true);
  };

  const openAddressModal = () => {
    loadSavedAddresses(true, !selectedAddress);
  };

  const checkModalPinCode = async () => {
    const cleanPin = modalPinCode.replace(/\D/g, '').slice(0, 6);
    setModalPinCode(cleanPin);
    setModalPinError('');

    if (cleanPin.length !== 6) {
      setModalPinError('Please enter a valid 6 digit PIN code.');
      return;
    }

    setModalPinLoading(true);

    try {
      const response = await apiFetch(`/api/pincode/${cleanPin}`);
      const data = await response.json();

      if (!response.ok) {
        setModalPinError(data.error || 'No delivery location found for this PIN code.');
        return;
      }

      saveDeliveryLocation(data);
      setDeliveryLocation(data);
      applyDeliveryLocationToForm(data);
      setShowAddressForm(true);
      toast.success(`Address details fetched for ${data.pin}`);
    } catch {
      setModalPinError('PIN lookup failed. Please try again.');
    } finally {
      setModalPinLoading(false);
    }
  };

  const saveAddress = async () => {
    const user = getUser();
    if (!user?.id) {
      openLoginModal();
      return;
    }

    const res = await apiFetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addressForm, user_id: user.id }),
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || 'Address save failed.');
      return;
    }

    setAddresses((prev) => [data, ...prev]);
    setSelectedAddress(data);
    setShowAddressForm(false);
    setAddressModalOpen(false);
    setCheckoutStep('bag');
    setAddressForm({
      full_name: '',
      phone: '',
      pin_code: '',
      address_line: '',
      city: '',
      state: '',
    });
    toast.success('Address saved successfully.');
  };

  const handlePlaceOrder = async (selectedPaymentMethod = paymentMethod) => {
    const user = getUser();

    if (!user?.id) {
      openLoginModal();
      return;
    }

    if (!selectedAddress) {
      openAddressModal();
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method before checkout.');
      return;
    }

    const paymentItems = cartItems.map((item) => ({
      product_id: item.product.id,
      brand: item.product.brand,
      name: `${item.product.brand} ${item.product.name}`.trim(),
      image: item.product.image,
      size: item.product.size || '',
      color: item.product.color || 'As shown',
      quantity: item.quantity,
      price: item.product.price,
    }));

    if (selectedPaymentMethod === 'cod') {
      setPaymentLoading(true);

      try {
        const response = await apiFetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            user_email: user.email,
            user_name: user.fullName || user.name || user.email,
            total,
            items: paymentItems,
            address_id: selectedAddress.id,
            payment_method: 'cod',
          }),
        });
        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error || 'Order creation failed.');
          return;
        }

        saveOrderCheckoutSnapshot(result.order.id, paymentItems, selectedAddress);
        writeCart([]);
        setCartItems([]);
        addNotification({
          userId: user.id,
          type: 'order',
          title: 'COD order placed',
          message: `Order ${String(result.order.id).slice(0, 8).toUpperCase()} was placed successfully. Track it from My Orders.`,
          href: `/profile/orders/${result.order.id}`,
        });
        setPaymentSuccessOrderId(result.order.id);
      } catch {
        toast.error('Order creation failed. Please try again.');
      } finally {
        setPaymentLoading(false);
      }

      return;
    }

    if (selectedPaymentMethod === 'gpay') {
      setPaymentLoading(true);

      try {
        const paymentData = await loadGooglePayTestPayment(total);
        const googlePayToken = paymentData.paymentMethodData?.tokenizationData?.token || '';
        const verifyRes = await apiFetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: `googlepay_test_order_${Date.now()}`,
            razorpay_payment_id: `googlepay_test_${Date.now()}`,
            razorpay_signature: googlePayToken || 'googlepay_test_token',
            user_id: user.id,
            user_email: user.email,
            user_name: user.fullName || user.name || user.email,
            amount: total,
            items: paymentItems,
            address_id: selectedAddress.id,
          }),
        });
        const result = await verifyRes.json();

        if (result.order) {
          saveOrderCheckoutSnapshot(result.order.id, paymentItems, selectedAddress);
          writeCart([]);
          setCartItems([]);
          addNotification({
            userId: user.id,
            type: 'order',
            title: 'Google Pay test successful',
            message: `Order ${String(result.order.id).slice(0, 8).toUpperCase()} is confirmed from Google Pay test mode.`,
            href: `/profile/orders/${result.order.id}`,
          });
          setPaymentSuccessOrderId(result.order.id);
          return;
        }

        toast.error(result.error || 'Google Pay test payment failed.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Google Pay test payment was cancelled.';
        toast.error(message);
      } finally {
        setPaymentLoading(false);
      }

      return;
    }

    if (!window.Razorpay) {
      toast.error('Payment gateway is still loading. Please try again.');
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      toast.error('Razorpay test key missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local and restart Next.js.');
      return;
    }

    setPaymentLoading(true);

    try {
      const orderRes = await apiFetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const order = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(order.error || 'Payment order creation failed.');
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: 'INR',
        name: 'SHOPORE',
        image: `${window.location.origin}/icon.png`,
        description: 'Credit Card Test Payment',
        method: {
          card: true,
          upi: false,
          netbanking: false,
          wallet: false,
          emi: false,
          paylater: false,
        },
        handler: async (response: RazorpayResponse) => {
          const verifyRes = await apiFetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || '',
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || '',
              user_id: user.id,
              user_email: user.email,
              user_name: user.fullName || user.name || user.email,
              amount: total,
              items: paymentItems,
              address_id: selectedAddress.id,
            }),
          });
          const result = await verifyRes.json();

          if (result.order) {
            saveOrderCheckoutSnapshot(result.order.id, paymentItems, selectedAddress);
            writeCart([]);
            setCartItems([]);
            setPaymentLoading(false);
            addNotification({
              userId: user.id,
              type: 'order',
              title: 'Payment successful',
              message: `Order ${String(result.order.id).slice(0, 8).toUpperCase()} is confirmed. Track it from My Orders.`,
              href: `/profile/orders/${result.order.id}`,
            });
            setPaymentSuccessOrderId(result.order.id);
            return;
          }

          setPaymentLoading(false);
          toast.error(result.error || 'Payment verification failed.');
        },
        prefill: {
          name: user.fullName || user.name || '',
          email: user.email || '',
          contact: selectedAddress.phone,
        },
        notes: {
          address: `${selectedAddress.address_line}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pin_code}`,
        },
        theme: {
          color: '#071225',
        },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      new window.Razorpay(options).open();
    } catch {
      setPaymentLoading(false);
      toast.error('Payment failed. Please try again.');
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);

    if (method === 'card' || method === 'gpay') {
      handlePlaceOrder(method);
    }
  };

  const continueCheckout = () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method before checkout.');
      return;
    }

    if (!selectedAddress) {
      openAddressModal();
      return;
    }

    handlePlaceOrder(paymentMethod);
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 0 && subtotal < 300 ? 99 : 0;
  const total = subtotal + deliveryFee;
  const steps: CheckoutStep[] = ['bag', 'address', 'payment'];
  const activeStepIndex = steps.indexOf(checkoutStep);
  const checkedLocationText = deliveryLocation
    ? `${deliveryLocation.name ? `${deliveryLocation.name}, ` : ''}${deliveryLocation.district}, ${deliveryLocation.state} - ${deliveryLocation.pin}`
    : '';
  const selectedAddressText = selectedAddress
    ? `${selectedAddress.address_line}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pin_code}`
    : '';
  const deliverySummaryText = selectedAddressText || checkedLocationText || 'Please select a delivery address.';
  const showCartAddressButton = true;
  const cartAddressButtonLabel = selectedAddress ? 'Change Address' : 'Add Address';
  const actionLabel =
    paymentLoading
      ? paymentMethod === 'cod'
        ? 'Placing Order...'
        : paymentMethod === 'gpay'
          ? 'Opening Google Pay...'
          : 'Opening Payment...'
      : 'Check Out';

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 pb-16 pt-[120px] font-['DM_Sans',Inter,sans-serif] text-[#071225] md:px-8">
      <div className="mx-auto max-w-[1240px] px-1 py-7 md:px-4 md:py-10">
        <div className="hidden">
          {[
            { key: 'bag', label: 'Bag' },
            { key: 'address', label: 'Address' },
            { key: 'payment', label: 'Payment' },
          ].map((step, index) => {
            const isActive = index === activeStepIndex;
            const isDone = index < activeStepIndex;

            return (
              <div key={step.key} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#071225]"
                >
                  {(isActive || isDone) && <span className="h-2.5 w-2.5 rounded-full bg-[#071225]" />}
                </span>
                <span className={isActive || isDone ? 'font-semibold' : 'text-slate-600'}>
                  {step.label}
                </span>
                {index < 2 && (
                <span className={`h-px w-10 sm:w-24 lg:w-40 ${index < activeStepIndex ? 'bg-[#071225]' : 'bg-slate-300'}`} />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className={`${cartItems.length === 0 ? 'hidden' : 'mb-6 inline-flex'} items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-[#071225] shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md`}
        >
          <span className="text-[20px] leading-none">←</span>
          Back
        </button>

        {cartItems.length === 0 ? (
          <div className="mx-auto max-w-[560px] bg-white px-8 py-14 text-center shadow-sm">
            <h1 className="text-[24px] font-semibold">Your bag is empty</h1>
            <p className="mt-3 text-[14px] text-slate-500">
              Add something you love and it will appear here.
            </p>
            <Link
              href={CONTINUE_SHOPPING_HREF}
              className="mt-8 inline-flex h-12 items-center justify-center bg-[#071225] px-8 text-[15px] font-semibold text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              {checkoutStep === 'bag' && (
                <>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h1 className="text-[24px] font-bold">Shopping Cart</h1>
                    <Link
                      href={CONTINUE_SHOPPING_HREF}
                      className="rounded-full bg-slate-100 px-4 py-2 text-[12px] font-semibold text-[#071225] transition hover:bg-slate-200"
                    >
                      Continue shopping &gt;
                    </Link>
                  </div>

                  <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-[14px] text-[#a0462d]">
                      <MapPin size={17} />
                      <span>
                        {deliverySummaryText}
                      </span>
                    </div>
                    {showCartAddressButton && (
                      <button
                        type="button"
                        onClick={openAddressModal}
                        className="h-10 w-full cursor-pointer rounded-lg border border-[#071225] bg-white px-5 text-[13px] font-semibold shadow-sm transition hover:bg-[#071225] hover:text-white sm:w-auto sm:min-w-[142px]"
                      >
                        {addressLoading ? (
                          <RoundLoader label="" size={22} />
                        ) : (
                          cartAddressButtonLabel
                        )}
                      </button>
                    )}
                  </div>

                  <div className="mb-2 hidden grid-cols-[minmax(250px,1fr)_90px_120px_110px_64px] items-center gap-3 border-b border-slate-200 px-2 pb-3 text-[12px] font-semibold text-slate-500 md:grid">
                    <span className="pl-[88px]">product</span>
                    <span>Size</span>
                    <span>Quantity</span>
                    <span>Total Price</span>
                    <button
                      type="button"
                      onClick={() => {
                        writeCart([]);
                        setCartItems([]);
                      }}
                      className="whitespace-nowrap text-right text-[11px] font-medium text-black"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {cartItems.map((item) => (
                      <article key={item.key} className="bg-white px-2 py-5">
                        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[minmax(250px,1fr)_90px_120px_110px_64px]">
                          <Link
                            href={buildCartProductHref(item.product)}
                            className="flex min-w-0 items-center gap-4"
                          >
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-contain"
                                sizes="80px"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-bold text-black">{item.product.brand}</p>
                              <p className="mt-1 truncate text-[12px] text-slate-600">{item.product.name}</p>
                            </div>
                          </Link>

                          <select
                            value={item.product.size || 'M'}
                            onChange={(event) => updateItemSize(item.key, event.target.value)}
                            className="h-10 w-24 rounded-lg border-0 bg-slate-100 px-3 text-[13px] outline-none"
                            aria-label={`Size for ${item.product.name}`}
                          >
                            {['XS', 'S', 'M', 'L', 'XL', '2XL'].map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-4 text-center text-[12px]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-black transition hover:bg-slate-200"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <p className="text-[12px] font-bold text-black">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>

                          <div className="flex justify-end">
                            <button
                              onClick={() => setPendingDeleteKey(item.key)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[0px] text-transparent transition hover:bg-slate-100"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} strokeWidth={2} className="text-black" />
                            ×
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {checkoutStep === 'address' && (
                <div className="space-y-5">
                  <div className="bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h1 className="text-[20px] font-semibold">Delivery Address</h1>
                      <button
                        type="button"
                        onClick={openAddressModal}
                        className="border border-[#071225] px-5 py-2 text-[14px] font-semibold"
                      >
                        Change
                      </button>
                    </div>
                    {selectedAddress ? (
                      <div className="border border-slate-200 p-4 text-[14px]">
                        <p className="font-semibold text-[#071225]">{selectedAddress.full_name}</p>
                        <p className="mt-1 text-slate-600">{selectedAddress.phone}</p>
                        <p className="mt-2 leading-6 text-slate-600">
                          {selectedAddress.address_line}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pin_code}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={openAddressModal}
                        className="h-12 w-full border border-[#071225] text-[14px] font-semibold"
                      >
                        Select Address
                      </button>
                    )}
                  </div>

                  <div className="bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-[15px] font-semibold uppercase tracking-wide text-slate-500">
                      Delivery Estimates
                    </h2>
                    <div className="divide-y divide-slate-100 border border-slate-100">
                      {cartItems.map((item) => (
                        <div key={item.key} className="flex items-center gap-4 p-4">
                          <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-slate-100">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <p className="text-[14px] text-slate-600">
                            Estimated Delivery:{' '}
                            <span className="font-semibold text-[#071225]">28 May 2026</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="space-y-5">
                  <div className="bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h1 className="text-[20px] font-semibold">Payment Method</h1>
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('address')}
                        className="text-[14px] font-semibold text-[#a04f35]"
                      >
                        Change Address
                      </button>
                    </div>
                    {PAYMENT_METHODS.map((method) => {
                      const active = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => handlePaymentMethodSelect(method.id)}
                          className={`mt-3 flex w-full items-center justify-between border bg-white p-4 text-left ${active ? 'border-[#071225]' : 'border-slate-200'}`}
                        >
                          <span className="flex items-center gap-3">
                            <Image
                              src={method.icon}
                              alt={method.iconAlt}
                              width={42}
                              height={28}
                              className="h-7 w-10 shrink-0 object-contain"
                            />
                            <span>
                              <span className="block text-[15px] font-semibold">{method.title}</span>
                              <span className="mt-1 block text-[13px] text-slate-500">{method.subtitle}</span>
                            </span>
                          </span>
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-[#071225]' : 'border-slate-300'}`}>
                            {active && <span className="h-2.5 w-2.5 rounded-full bg-[#071225]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {(selectedAddress || deliveryLocation) && (
                    <div className="bg-white p-5 shadow-sm">
                      <h2 className="mb-3 text-[15px] font-semibold">Delivering To</h2>
                      {selectedAddress ? (
                        <>
                          <p className="text-[14px] font-semibold">{selectedAddress.full_name}</p>
                          <p className="mt-2 text-[14px] leading-6 text-slate-600">{selectedAddressText}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[14px] font-semibold">
                            {deliveryLocation ? `PIN ${deliveryLocation.pin}` : ''}
                          </p>
                          <p className="mt-2 text-[14px] leading-6 text-slate-600">
                            {checkedLocationText}
                          </p>
                          {deliveryLocation && (
                            <p className="mt-2 text-[12px] font-semibold text-[#a0462d]">
                              Add or select a full address for this PIN before payment.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            <aside className="space-y-6">

              <div className="sticky top-[110px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-[22px] font-bold">Shopping Cart</h2>
                <p className="mt-5 text-[12px] font-semibold uppercase tracking-wide text-slate-500">Payment Method:</p>

                <div className="mt-3 space-y-3 text-[12px]">
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-50">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === method.id}
                        onChange={() => handlePaymentMethodSelect(method.id)}
                        className="h-4 w-4 accent-[#1f1b1f]"
                      />
                      <Image
                        src={method.icon}
                        alt={method.iconAlt}
                        width={28}
                        height={20}
                        className="h-5 w-7 shrink-0 object-contain"
                      />
                      {method.title}
                    </label>
                  ))}
                </div>

                <div className="mt-6 space-y-4 border-t border-slate-200 pt-5 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total MRP</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      Delivery Fee <Info size={13} />
                    </span>
                    <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[13px]">
                    <Info size={15} />
                    <span>TIP: Shop for ₹300.00 or more for free delivery.</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-between gap-4 rounded-xl bg-slate-50 px-4 py-4 text-[16px] sm:text-[18px]">
                  <span className="font-semibold">Total Payable amount</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>

                <button
                  onClick={continueCheckout}
                  disabled={paymentLoading}
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#071225] text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#111d31] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentLoading ? (
                    <RoundLoader label={actionLabel} size={24} className="text-white" />
                  ) : (
                    actionLabel
                  )}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>

      {addressModalOpen && (
        <div
          className="fixed inset-0 z-[300] flex justify-end bg-black/70"
          onClick={() => setAddressModalOpen(false)}
        >
          <aside
            className="h-full w-full max-w-[460px] overflow-y-auto bg-white px-5 py-6 shadow-2xl sm:px-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-[17px] font-medium text-[#1f2937]">
                Select From Saved Addresses
              </h2>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="cursor-pointer text-slate-500 transition hover:text-[#071225]"
                aria-label="Close address selector"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex h-12 border border-slate-500">
              <input
                type="text"
                value={modalPinCode}
                onChange={(event) => {
                  setModalPinCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                  setModalPinError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    checkModalPinCode();
                  }
                }}
                placeholder="Enter your PIN code"
                inputMode="numeric"
                maxLength={6}
                className="min-w-0 flex-1 px-4 text-[14px] outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={checkModalPinCode}
                disabled={modalPinLoading}
                className="cursor-pointer px-5 text-[14px] font-medium disabled:opacity-60"
              >
                {modalPinLoading ? <RoundLoader label="" size={22} /> : 'Change'}
              </button>
            </div>

            {addressLoading && (
              <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 px-4 py-5">
                <RoundLoader label="Loading saved addresses..." size={32} />
              </div>
            )}

            {deliveryLocation && (
              <div className="mt-3 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
                <p className="font-bold">Fetched location for {deliveryLocation.pin}</p>
                <p className="mt-1">
                  {deliveryLocation.name ? `${deliveryLocation.name}, ` : ''}
                  {deliveryLocation.district}, {deliveryLocation.state}, {deliveryLocation.country}
                  {deliveryLocation.deliveryStatus ? ` · ${deliveryLocation.deliveryStatus}` : ''}
                </p>
              </div>
            )}

            {modalPinError && (
              <p className="mt-2 text-[13px] font-semibold text-red-600">{modalPinError}</p>
            )}

            <button
              type="button"
              onClick={() => {
                applyDeliveryLocationToForm(deliveryLocation);
                setShowAddressForm((prev) => !prev);
              }}
              className="mt-3 flex h-12 w-full cursor-pointer items-center justify-between rounded bg-[#f5f1ec] px-4 text-left text-[15px] text-[#a04f35]"
            >
              <span className="flex items-center gap-2">
                <Plus size={20} />
                Add New Address
              </span>
              <ChevronRight size={18} />
            </button>

            {showAddressForm && (
              <div className="mt-5 space-y-3">
                {[
                  ['full_name', 'Full name'],
                  ['phone', 'Phone number'],
                  ['pin_code', 'PIN code'],
                  ['address_line', 'House / Street / Area'],
                  ['city', 'City'],
                  ['state', 'State'],
                ].map(([field, label]) => (
                  <input
                    key={field}
                    value={addressForm[field as keyof typeof addressForm]}
                    onChange={(event) =>
                      setAddressForm((prev) => ({ ...prev, [field]: event.target.value }))
                    }
                    placeholder={label}
                    className="h-11 w-full border border-slate-300 px-4 text-[14px] outline-none focus:border-[#071225]"
                  />
                ))}
                <button
                  type="button"
                  onClick={saveAddress}
                  className="h-11 w-full bg-[#071225] text-[14px] font-semibold text-white"
                >
                  Save Address
                </button>
              </div>
            )}

            {!addressLoading && addresses.length > 0 ? (
              <div className="mt-5 space-y-3">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => {
                      setSelectedAddress(address);
                      setDeliveryLocation(null);
                      setCheckoutStep('bag');
                      setAddressModalOpen(false);
                    }}
                    className={`w-full border p-4 text-left text-[14px] ${selectedAddress?.id === address.id ? 'border-[#071225]' : 'border-slate-200'
                      }`}
                  >
                    <p className="font-semibold text-[#071225]">{address.full_name}</p>
                    <p className="mt-1 text-slate-600">{address.phone}</p>
                    <p className="mt-2 text-slate-600">
                      {address.address_line}, {address.city}, {address.state} - {address.pin_code}
                    </p>
                  </button>
                ))}
              </div>
            ) : !addressLoading ? (
              <div className="flex h-[430px] flex-col items-center justify-center text-center">
                <div className="mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-[#f3ede6]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#e5bd8f] text-[#d9a36c]">
                    <MapPin size={38} strokeWidth={1.6} />
                  </div>
                </div>
                <h3 className="text-[21px] font-medium text-[#1f2937]">No Address Saved Yet</h3>
                <p className="mt-2 max-w-[360px] text-[16px] leading-6 text-slate-500">
                  Your address book is empty. Add an address to complete your checkout.
                </p>
              </div>
            ) : null}
          </aside>
        </div>
      )}
      {pendingDeleteKey && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[340px] rounded-lg bg-white p-6 text-center shadow-xl">
            <h3 className="text-[18px] font-semibold text-black">Are you sure?</h3>
            <p className="mt-2 text-[14px] text-slate-600">Do you want to delete this product?</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteKey(null)}
                className="h-10 rounded-md bg-slate-200 px-5 text-[14px] font-semibold text-slate-700"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => removeItem(pendingDeleteKey)}
                className="h-10 rounded-md bg-red-600 px-5 text-[14px] font-semibold text-white"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {paymentSuccessOrderId && (
        <div className="fixed inset-0 z-[330] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[380px] rounded-lg bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-[28px] font-bold text-emerald-700">
              ✓
            </div>
            <h3 className="mt-4 text-[20px] font-semibold text-black">Payment Successful</h3>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              Your order has been placed successfully. You can track it from My Orders.
            </p>
            <Link
              href="/profile?section=orders"
              prefetch
              onClick={() => setPaymentSuccessOrderId(null)}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-[#071225] text-[14px] font-semibold text-white"
            >
              View My Orders
            </Link>
          </div>
        </div>
      )}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </main>
  );
}
