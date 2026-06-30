const INDIA_TIME_ZONE = 'Asia/Kolkata';
const ESTIMATED_DELIVERY_DAYS = 4;

export function parseApiDate(value?: string | null) {
  if (!value) return new Date();

  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

export function getEstimatedDeliveryDate(from: string | Date = new Date()) {
  const date = from instanceof Date ? new Date(from) : parseApiDate(from);
  date.setUTCDate(date.getUTCDate() + ESTIMATED_DELIVERY_DAYS);
  return date;
}

export function formatEstimatedDelivery(
  from: string | Date = new Date(),
  options: { includeYear?: boolean } = {},
) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: options.includeYear ? 'numeric' : undefined,
    timeZone: INDIA_TIME_ZONE,
  }).format(getEstimatedDeliveryDate(from));
}
