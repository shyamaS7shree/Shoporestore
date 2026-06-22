export type ShoporeNotificationType = 'order' | 'cancel' | 'refund' | 'delivery' | 'account';

export type ShoporeNotification = {
  id: string;
  userId: string;
  type: ShoporeNotificationType;
  title: string;
  message: string;
  href?: string;
  createdAt: string;
  read: boolean;
};

const NOTIFICATIONS_KEY = 'shopore_notifications';
export const NOTIFICATIONS_EVENT = 'shopore-notifications-updated';

function readAllNotifications() {
  if (typeof window === 'undefined') return [] as ShoporeNotification[];

  try {
    const data = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    return Array.isArray(data) ? data as ShoporeNotification[] : [];
  } catch {
    return [];
  }
}

function writeAllNotifications(notifications: ShoporeNotification[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 80)));
  window.dispatchEvent(new Event(NOTIFICATIONS_EVENT));
}

export function getNotifications(userId?: string) {
  if (!userId) return [];
  return readAllNotifications()
    .filter((notification) => notification.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addNotification(notification: Omit<ShoporeNotification, 'id' | 'createdAt' | 'read'>) {
  if (!notification.userId || typeof window === 'undefined') return;

  const nextNotification: ShoporeNotification = {
    ...notification,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  writeAllNotifications([nextNotification, ...readAllNotifications()]);
}

export function markNotificationsRead(userId?: string) {
  if (!userId) return;

  writeAllNotifications(
    readAllNotifications().map((notification) =>
      notification.userId === userId ? { ...notification, read: true } : notification
    )
  );
}
