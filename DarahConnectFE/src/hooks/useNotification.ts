import { useState, useRef, useCallback } from 'react';
import { NotificationProps, NotificationType, NotificationAction } from '../components/Notification';

interface NotificationData {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  showProgress?: boolean;
  actions?: NotificationAction[];
  dismissible?: boolean;
  persistent?: boolean;
  sound?: boolean;
  onAction?: (actionIndex: number) => void;
}

interface NotificationSettings {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
  defaultDuration?: number;
  enableSounds?: boolean;
  enableProgress?: boolean;
}

export const useNotification = (settings: NotificationSettings = {}) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const notificationQueue = useRef<NotificationData[]>([]);
  
  const {
    position = 'top-right',
    maxNotifications = 5,
    defaultDuration = 5000,
    enableSounds = true,
    enableProgress = true,
  } = settings;

  const processQueue = useCallback(() => {
    if (notificationQueue.current.length > 0 && notifications.length < maxNotifications) {
      const nextNotification = notificationQueue.current.shift();
      if (nextNotification) {
        addNotificationDirect(nextNotification);
      }
    }
  }, [notifications.length, maxNotifications]);

  const addNotificationDirect = useCallback((data: NotificationData) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: NotificationProps = {
      id,
      duration: defaultDuration,
      showProgress: enableProgress,
      dismissible: true,
      persistent: false,
      sound: enableSounds,
      ...data,
      onClose: () => {}, // Will be set by container
    };

    setNotifications(prev => {
      const newNotifications = [...prev, notification];
      // Auto-remove old notifications if exceeding max
      if (newNotifications.length > maxNotifications) {
        return newNotifications.slice(-maxNotifications);
      }
      return newNotifications;
    });

    // Auto remove after duration (if not persistent)
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  }, [defaultDuration, enableProgress, enableSounds, maxNotifications]);

  const addNotification = useCallback((data: NotificationData) => {
    if (notifications.length >= maxNotifications) {
      // Add to queue
      notificationQueue.current.push(data);
    } else {
      addNotificationDirect(data);
    }
  }, [notifications.length, maxNotifications, addNotificationDirect]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const filtered = prev.filter(notification => notification.id !== id);
      // Process queue after removing
      setTimeout(processQueue, 100);
      return filtered;
    });
  }, [processQueue]);

  const updateNotification = useCallback((id: string, updates: Partial<NotificationData>) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  // Quick notification methods
  const showSuccess = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<NotificationData>
  ) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: 4000,
      sound: true,
      ...options,
    });
  }, [addNotification]);

  const showError = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<NotificationData>
  ) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 6000,
      sound: true,
      persistent: false,
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<NotificationData>
  ) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000,
      ...options,
    });
  }, [addNotification]);

  const showInfo = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<NotificationData>
  ) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options,
    });
  }, [addNotification]);

  // Advanced methods
  const showWithActions = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    actions: NotificationAction[],
    options?: Partial<NotificationData>
  ) => {
    addNotification({
      type,
      title,
      message,
      actions,
      persistent: true, // Usually persistent when has actions
      ...options,
    });
  }, [addNotification]);

  const showPersistent = useCallback((
    type: NotificationType,
    title: string,
    message?: string,
    options?: Partial<NotificationData>
  ) => {
    addNotification({
      type,
      title,
      message,
      persistent: true,
      dismissible: true,
      ...options,
    });
  }, [addNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    notificationQueue.current = [];
  }, []);

  const clearByType = useCallback((type: NotificationType) => {
    setNotifications(prev => prev.filter(notification => notification.type !== type));
  }, []);

  const pauseAll = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, persistent: true }))
    );
  }, []);

  const resumeAll = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, persistent: false }))
    );
  }, []);

  // Stats
  const stats = {
    total: notifications.length,
    byType: {
      success: notifications.filter(n => n.type === 'success').length,
      error: notifications.filter(n => n.type === 'error').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      info: notifications.filter(n => n.type === 'info').length,
    },
    queued: notificationQueue.current.length,
  };

  return {
    // State
    notifications,
    settings: { position, maxNotifications, defaultDuration, enableSounds, enableProgress },
    stats,

    // Core methods
    addNotification,
    removeNotification,
    updateNotification,
    clearAll,

    // Quick methods
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Advanced methods
    showWithActions,
    showPersistent,
    clearByType,
    pauseAll,
    resumeAll,
  };
};

export default useNotification;