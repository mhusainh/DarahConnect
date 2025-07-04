import { useNotification } from './useNotification';

interface EnhancedNotificationOptions {
  title: string;
  message: string;
  duration?: number;
  emoji?: string;
}

export const useEnhancedNotification = () => {
  const { addNotification } = useNotification();

  const showSuccess = (options: EnhancedNotificationOptions) => {
    const emoji = options.emoji || '🎉';
    addNotification({
      type: 'success',
      title: `${emoji} ${options.title}`,
      message: options.message,
      duration: options.duration || 4000
    });
  };

  const showError = (options: EnhancedNotificationOptions) => {
    const emoji = options.emoji || '❌';
    addNotification({
      type: 'error',
      title: `${emoji} ${options.title}`,
      message: options.message,
      duration: options.duration || 6000
    });
  };

  const showWarning = (options: EnhancedNotificationOptions) => {
    const emoji = options.emoji || '⚠️';
    addNotification({
      type: 'warning',
      title: `${emoji} ${options.title}`,
      message: options.message,
      duration: options.duration || 5000
    });
  };

  const showInfo = (options: EnhancedNotificationOptions) => {
    const emoji = options.emoji || 'ℹ️';
    addNotification({
      type: 'info',
      title: `${emoji} ${options.title}`,
      message: options.message,
      duration: options.duration || 3000
    });
  };

  const showLoading = (options: EnhancedNotificationOptions) => {
    const emoji = options.emoji || '🔄';
    addNotification({
      type: 'info',
      title: `${emoji} ${options.title}`,
      message: options.message,
      duration: options.duration || 2000
    });
  };

  // Quick preset notifications
  const presets = {
    deleteSuccess: (itemName: string) => showSuccess({
      title: 'Berhasil Dihapus!',
      message: `${itemName} telah berhasil dihapus dari sistem.`,
      emoji: '🗑️'
    }),

    updateSuccess: (itemName: string) => showSuccess({
      title: 'Berhasil Diperbarui!',
      message: `${itemName} telah berhasil diperbarui.`,
      emoji: '✨'
    }),

    createSuccess: (itemName: string) => showSuccess({
      title: 'Berhasil Dibuat!',
      message: `${itemName} telah berhasil dibuat.`,
      emoji: '🎉'
    }),

    networkError: () => showError({
      title: 'Koneksi Bermasalah',
      message: 'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.',
      emoji: '🌐'
    }),

    unauthorized: () => showError({
      title: 'Akses Ditolak',
      message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
      emoji: '🔒'
    }),

    serverError: () => showError({
      title: 'Server Error',
      message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
      emoji: '🚫'
    }),

    dataRefreshed: (count: number) => showInfo({
      title: 'Data Diperbarui',
      message: `Menampilkan ${count} item terbaru.`,
      emoji: '🔄'
    }),

    filterCleared: () => showInfo({
      title: 'Filter Direset',
      message: 'Semua filter telah dihapus.',
      emoji: '🔄'
    }),

    loading: (action: string) => showLoading({
      title: 'Memproses...',
      message: `Sedang ${action}...`,
      emoji: '⏳'
    })
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    presets
  };
};

export default useEnhancedNotification; 