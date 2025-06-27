import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useNotification } from '../hooks/useNotification';
import { NotificationContainer } from '../components/Notification';
import { notificationManager } from '../utils/notification';
import { NotificationType, NotificationAction } from '../components/Notification';

interface NotificationContextType {
  // Quick methods
  showSuccess: (title: string, message?: string, options?: any) => void;
  showError: (title: string, message?: string, options?: any) => void;
  showWarning: (title: string, message?: string, options?: any) => void;
  showInfo: (title: string, message?: string, options?: any) => void;
  
  // Advanced methods
  showWithActions: (type: NotificationType, title: string, message: string, actions: NotificationAction[], options?: any) => void;
  showPersistent: (type: NotificationType, title: string, message?: string, options?: any) => void;
  
  // Management methods
  clearAll: () => void;
  clearByType: (type: NotificationType) => void;
  pauseAll: () => void;
  resumeAll: () => void;
  
  // Stats
  stats: {
    total: number;
    byType: {
      success: number;
      error: number;
      warning: number;
      info: number;
    };
    queued: number;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
  defaultDuration?: number;
  enableSounds?: boolean;
  enableProgress?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children,
  position = 'top-right',
  maxNotifications = 5,
  defaultDuration = 5000,
  enableSounds = true,
  enableProgress = true,
}) => {
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showWithActions,
    showPersistent,
    clearAll,
    clearByType,
    pauseAll,
    resumeAll,
    stats,
  } = useNotification({
    position,
    maxNotifications,
    defaultDuration,
    enableSounds,
    enableProgress,
  });

  // Register callbacks with global notification manager
  useEffect(() => {
    notificationManager.register({
      showSuccess,
      showError,
    });
  }, [showSuccess, showError]);

  const value: NotificationContextType = {
    // Quick methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Advanced methods
    showWithActions,
    showPersistent,
    
    // Management methods
    clearAll,
    clearByType,
    pauseAll,
    resumeAll,
    
    // Stats
    stats,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification}
        position={position}
        maxNotifications={maxNotifications}
      />
    </NotificationContext.Provider>
  );
};

// Convenience hook for common notification patterns
export const useQuickNotifications = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotificationContext();
  
  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    
    // Common patterns
    saveSuccess: (entity = 'Data') => showSuccess('Berhasil Disimpan', `${entity} berhasil disimpan`),
    saveError: (error?: string) => showError('Gagal Menyimpan', error || 'Terjadi kesalahan saat menyimpan data'),
    deleteSuccess: (entity = 'Data') => showSuccess('Berhasil Dihapus', `${entity} berhasil dihapus`),
    deleteError: (error?: string) => showError('Gagal Menghapus', error || 'Terjadi kesalahan saat menghapus data'),
    updateSuccess: (entity = 'Data') => showSuccess('Berhasil Diperbarui', `${entity} berhasil diperbarui`),
    updateError: (error?: string) => showError('Gagal Memperbarui', error || 'Terjadi kesalahan saat memperbarui data'),
    networkError: () => showError('Koneksi Bermasalah', 'Periksa koneksi internet Anda dan coba lagi'),
    unauthorized: () => showError('Akses Ditolak', 'Anda tidak memiliki izin untuk mengakses fitur ini'),
    validationError: (message?: string) => showWarning('Data Tidak Valid', message || 'Periksa kembali data yang Anda masukkan'),
  };
};

export default NotificationContext; 