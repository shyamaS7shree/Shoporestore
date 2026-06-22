export type DeliveryLocation = {
  pin: string;
  name: string;
  district: string;
  state: string;
  country: string;
  deliveryStatus: string;
};

const DELIVERY_LOCATION_KEY = 'shopore-delivery-location';
const DELIVERY_LOCATION_EVENT = 'shopore-delivery-location-updated';

export function getDeliveryLocationEventName() {
  return DELIVERY_LOCATION_EVENT;
}

export function readDeliveryLocation(): DeliveryLocation | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawLocation = window.localStorage.getItem(DELIVERY_LOCATION_KEY);
    return rawLocation ? JSON.parse(rawLocation) : null;
  } catch {
    return null;
  }
}

export function saveDeliveryLocation(location: DeliveryLocation) {
  window.localStorage.setItem(DELIVERY_LOCATION_KEY, JSON.stringify(location));
  window.dispatchEvent(new Event(DELIVERY_LOCATION_EVENT));
}
