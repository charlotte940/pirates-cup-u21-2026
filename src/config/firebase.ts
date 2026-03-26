import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Initialize messaging (will be null if not supported)
let messaging: ReturnType<typeof getMessaging> | null = null;

// Initialize messaging asynchronously
const initMessaging = async () => {
  if (await isSupported()) {
    messaging = getMessaging(app);
  }
};
initMessaging();

// Push Notification Functions
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) return null;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const getNotificationPermissionStatus = (): NotificationPermission => {
  if (typeof Notification === 'undefined') return 'default';
  return Notification.permission;
};

export const onForegroundMessage = (callback: (payload: { title?: string; body?: string; icon?: string; data?: Record<string, unknown> }) => void) => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    callback({
      title: payload.notification?.title,
      body: payload.notification?.body,
      icon: payload.notification?.icon,
      data: payload.data as Record<string, unknown>
    });
  });
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      return registration;
    }
    return null;
  } catch (error) {
    console.error('Error registering service worker:', error);
    return null;
  }
};

export const isMessagingSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

export default app;
