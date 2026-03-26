import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Trash2, Settings } from 'lucide-react';
import {
  initializePushNotifications,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  getUnreadCount,
  areNotificationsEnabled,
  type PushNotification,
} from '../services/pushNotificationService';
import { toast } from 'sonner';

interface NotificationBellProps {
  userRole: string;
  className?: string;
}

export default function NotificationBell({ userRole, className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
    setIsEnabled(areNotificationsEnabled());
  }, []);

  // Refresh notifications when bell is opened
  useEffect(() => {
    if (isOpen) {
      setNotifications(getNotifications());
      setUnreadCount(getUnreadCount());
    }
  }, [isOpen]);

  const handleEnableNotifications = async () => {
    setIsInitializing(true);
    
    const result = await initializePushNotifications(userRole, (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    if (result.success) {
      setIsEnabled(true);
      toast.success('Push notifications enabled!', {
        description: 'You will now receive updates from the Tournament Manager.',
      });
    } else {
      toast.error('Failed to enable notifications', {
        description: result.error || 'Please check your browser permissions.',
      });
    }
    
    setIsInitializing(false);
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    setNotifications(getNotifications());
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    clearNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-pirates-gray-100 transition-colors"
      >
        {isEnabled ? (
          <Bell className="w-5 h-5 text-pirates-gray-600" />
        ) : (
          <BellOff className="w-5 h-5 text-pirates-gray-400" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pirates-red text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-pirates-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-pirates-gray-100">
              <h3 className="font-medium text-pirates-black">Notifications</h3>
              <div className="flex items-center gap-1">
                {!isEnabled ? (
                  <button
                    onClick={handleEnableNotifications}
                    disabled={isInitializing}
                    className="p-2 text-pirates-red hover:bg-pirates-red/10 rounded-lg transition-colors"
                    title="Enable push notifications"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="p-2 text-pirates-gray-500 hover:text-pirates-black hover:bg-pirates-gray-100 rounded-lg transition-colors"
                        title="Mark all as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="p-2 text-pirates-gray-500 hover:text-pirates-red hover:bg-pirates-red/10 rounded-lg transition-colors"
                        title="Clear all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {!isEnabled ? (
                <div className="p-6 text-center">
                  <BellOff className="w-12 h-12 text-pirates-gray-300 mx-auto mb-3" />
                  <p className="text-pirates-gray-600 text-sm mb-3">
                    Push notifications are disabled
                  </p>
                  <button
                    onClick={handleEnableNotifications}
                    disabled={isInitializing}
                    className="px-4 py-2 bg-pirates-red text-white rounded-lg text-sm font-medium hover:bg-pirates-red/90 disabled:opacity-50"
                  >
                    {isInitializing ? 'Enabling...' : 'Enable Notifications'}
                  </button>
                  <p className="text-pirates-gray-400 text-xs mt-2">
                    Get instant updates from the Tournament Manager
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-12 h-12 text-pirates-gray-300 mx-auto mb-3" />
                  <p className="text-pirates-gray-500 text-sm">No notifications yet</p>
                  <p className="text-pirates-gray-400 text-xs mt-1">
                    You&apos;ll receive updates here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-pirates-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-pirates-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-pirates-red/5' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          !notification.read ? 'bg-pirates-red' : 'bg-transparent'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? 'font-medium text-pirates-black' : 'text-pirates-gray-600'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-pirates-gray-500 mt-1 line-clamp-2">
                            {notification.body}
                          </p>
                          <p className="text-xs text-pirates-gray-400 mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {isEnabled && notifications.length > 0 && (
              <div className="p-3 border-t border-pirates-gray-100 bg-pirates-gray-50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-xs text-pirates-gray-500 hover:text-pirates-black"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
