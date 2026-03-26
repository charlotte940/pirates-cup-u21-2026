import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  onForegroundMessage,
  registerServiceWorker,
  isMessagingSupported,
} from '../config/firebase';
import { toast } from 'sonner';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
}

export interface NotificationTarget {
  userId: string;
  role: 'manager' | 'fieldmanager' | 'registration' | 'all';
  fcmToken?: string;
}

// Store for received notifications
let notifications: PushNotification[] = [];
let unsubscribeHandler: (() => void) | null = null;

/**
 * Initialize push notifications for the current user
 */
export const initializePushNotifications = async (
  userRole: string,
  onNotificationReceived?: (notification: PushNotification) => void
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    // Check if messaging is supported
    if (!isMessagingSupported()) {
      return { success: false, error: 'Push notifications not supported in this browser' };
    }

    // Register service worker first
    const registration = await registerServiceWorker();
    if (!registration) {
      return { success: false, error: 'Failed to register service worker' };
    }

    // Wait a moment for service worker to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Request permission and get token
    const token = await requestNotificationPermission();
    
    if (!token) {
      const permission = getNotificationPermissionStatus();
      if (permission === 'denied') {
        return { success: false, error: 'Notification permission denied by user' };
      }
      return { success: false, error: 'Failed to get FCM token' };
    }

    // Store token in localStorage for demo purposes
    // In production, send this to your backend
    const storedTokens = JSON.parse(localStorage.getItem('fcm_tokens') || '{}');
    storedTokens[userRole] = token;
    localStorage.setItem('fcm_tokens', JSON.stringify(storedTokens));

    // Set up foreground message handler
    if (unsubscribeHandler) {
      unsubscribeHandler();
    }

    unsubscribeHandler = onForegroundMessage((payload) => {
      const notification: PushNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: payload.title || 'Pirates Cup U21',
        body: payload.body || 'New notification',
        icon: payload.icon || '/pirates-logo.png',
        data: payload.data,
        timestamp: new Date().toISOString(),
        read: false,
      };

      notifications.unshift(notification);
      localStorage.setItem('push_notifications', JSON.stringify(notifications));

      // Show toast notification
      toast.info(payload.title || 'New Notification', {
        description: payload.body,
        duration: 5000,
      });

      // Call custom handler if provided
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    return { success: true, token };
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Send a push notification (simulated for demo)
 * In production, this would call your backend API
 */
export const sendPushNotification = async (
  target: NotificationTarget,
  notification: { title: string; body: string; data?: Record<string, unknown> }
): Promise<{ success: boolean; sentCount: number; error?: string }> => {
  try {
    // Get all stored tokens
    const storedTokens = JSON.parse(localStorage.getItem('fcm_tokens') || '{}');
    
    // In a real app, you would:
    // 1. Send this to your backend
    // 2. Backend uses Firebase Admin SDK to send to FCM
    // 3. FCM delivers to devices

    // For demo, we'll simulate the notification
    const tokens: string[] = [];
    
    if (target.role === 'all') {
      tokens.push(...Object.values(storedTokens) as string[]);
    } else {
      const token = storedTokens[target.role];
      if (token) tokens.push(token);
    }

    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo: if this is the same device, show the notification locally
    if (target.role === 'all' || target.userId === 'local') {
      const newNotification: PushNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        timestamp: new Date().toISOString(),
        read: false,
      };

      notifications.unshift(newNotification);
      localStorage.setItem('push_notifications', JSON.stringify(notifications));

      toast.info(notification.title, {
        description: notification.body,
        duration: 5000,
      });
    }

    return { success: true, sentCount: tokens.length };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, sentCount: 0, error: String(error) };
  }
};

/**
 * Get all notifications
 */
export const getNotifications = (): PushNotification[] => {
  const stored = localStorage.getItem('push_notifications');
  if (stored) {
    notifications = JSON.parse(stored);
  }
  return notifications;
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = (notificationId: string): void => {
  notifications = notifications.map(n =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem('push_notifications', JSON.stringify(notifications));
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = (): void => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem('push_notifications', JSON.stringify(notifications));
};

/**
 * Clear all notifications
 */
export const clearNotifications = (): void => {
  notifications = [];
  localStorage.removeItem('push_notifications');
};

/**
 * Get unread notification count
 */
export const getUnreadCount = (): number => {
  return notifications.filter(n => !n.read).length;
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromNotifications = (): void => {
  if (unsubscribeHandler) {
    unsubscribeHandler();
    unsubscribeHandler = null;
  }
};

/**
 * Check if push notifications are enabled
 */
export const areNotificationsEnabled = (): boolean => {
  return getNotificationPermissionStatus() === 'granted';
};

/**
 * Get FCM token for a specific role
 */
export const getFCMTokenForRole = (role: string): string | null => {
  const storedTokens = JSON.parse(localStorage.getItem('fcm_tokens') || '{}');
  return storedTokens[role] || null;
};
