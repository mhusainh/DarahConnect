// Global notification utility
import { NotificationType } from '../components/Notification';

interface NotificationManager {
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning?: (title: string, message?: string) => void;
  showInfo?: (title: string, message?: string) => void;
}

class GlobalNotificationManager implements NotificationManager {
  private callbacks: {
    showSuccess?: (title: string, message?: string) => void;
    showError?: (title: string, message?: string) => void;
    showWarning?: (title: string, message?: string) => void;
    showInfo?: (title: string, message?: string) => void;
  } = {};
  
  private recentNotifications = new Set<string>();
  private readonly DUPLICATE_THRESHOLD = 2000; // 2 seconds

  // Method to register callbacks from React context
  register(callbacks: {
    showSuccess: (title: string, message?: string) => void;
    showError: (title: string, message?: string) => void;
    showWarning?: (title: string, message?: string) => void;
    showInfo?: (title: string, message?: string) => void;
  }) {
    this.callbacks = callbacks;
  }

  private isDuplicate(title: string, message?: string): boolean {
    const key = `${title}-${message || ''}`;
    if (this.recentNotifications.has(key)) {
      return true;
    }
    
    this.recentNotifications.add(key);
    setTimeout(() => {
      this.recentNotifications.delete(key);
    }, this.DUPLICATE_THRESHOLD);
    
    return false;
  }

  showSuccess(title: string, message?: string) {
    if (this.isDuplicate(title, message)) return;
    
    if (this.callbacks.showSuccess) {
      this.callbacks.showSuccess(title, message);
    } else {
      // Fallback to console if no React context available
      console.log(`✅ ${title}`, message || '');
    }
  }

  showError(title: string, message?: string) {
    if (this.isDuplicate(title, message)) return;
    
    if (this.callbacks.showError) {
      this.callbacks.showError(title, message);
    } else {
      // Fallback to console if no React context available
      console.error(`❌ ${title}`, message || '');
    }
  }

  showWarning(title: string, message?: string) {
    if (this.isDuplicate(title, message)) return;
    
    if (this.callbacks.showWarning) {
      this.callbacks.showWarning(title, message);
    } else {
      // Fallback to console if no React context available
      console.warn(`⚠️ ${title}`, message || '');
    }
  }

  showInfo(title: string, message?: string) {
    if (this.isDuplicate(title, message)) return;
    
    if (this.callbacks.showInfo) {
      this.callbacks.showInfo(title, message);
    } else {
      // Fallback to console if no React context available
      console.info(`ℹ️ ${title}`, message || '');
    }
  }

  // Enhanced method for API notifications
  showApiNotification(
    method: string, 
    success: boolean, 
    error?: string, 
    endpoint?: string,
    customMessages?: { success?: string; error?: string }
  ) {
    const methodName = getMethodDisplayName(method);
    
    if (success) {
      const title = customMessages?.success || `${methodName} Berhasil`;
      const message = endpoint ? `Data berhasil diproses pada ${endpoint}` : 'Data berhasil diproses';
      this.showSuccess(title, message);
    } else {
      const title = customMessages?.error || `${methodName} Gagal`;
      const message = error || 'Terjadi kesalahan saat memproses data';
      this.showError(title, message);
    }
  }

  // Method for showing notifications with specific types and better formatting
  showFormattedNotification(
    type: NotificationType,
    title: string,
    message?: string,
    context?: { 
      entity?: string; 
      action?: string; 
      error?: string;
      duration?: number;
    }
  ) {
    const formattedTitle = context?.entity 
      ? `${title} ${context.entity}` 
      : title;
    
    const formattedMessage = context?.error 
      ? `${message || ''}\nDetail: ${context.error}`.trim()
      : message;

    switch (type) {
      case 'success':
        this.showSuccess(formattedTitle, formattedMessage);
        break;
      case 'error':
        this.showError(formattedTitle, formattedMessage);
        break;
      case 'warning':
        this.showWarning(formattedTitle, formattedMessage);
        break;
      case 'info':
        this.showInfo(formattedTitle, formattedMessage);
        break;
    }
  }
}

// Global instance
export const notificationManager = new GlobalNotificationManager();

// Enhanced helper function to get method name for notification titles
export const getMethodDisplayName = (method: string): string => {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'Menyimpan';
    case 'PUT':
      return 'Memperbarui';
    case 'PATCH':
      return 'Memperbarui';
    case 'DELETE':
      return 'Menghapus';
    case 'GET':
      return 'Mengambil';
    default:
      return 'Memproses';
  }
};

// Helper function to determine if method should show notifications
export const shouldShowNotification = (method: string): boolean => {
  const nonNotifiableMethods = ['GET', 'HEAD', 'OPTIONS'];
  return !nonNotifiableMethods.includes(method.toUpperCase());
};

// Helper function to get notification type based on HTTP status
export const getNotificationTypeFromStatus = (status: number): NotificationType => {
  if (status >= 200 && status < 300) {
    return 'success';
  } else if (status >= 400 && status < 500) {
    return 'warning'; // Client errors
  } else if (status >= 500) {
    return 'error'; // Server errors
  } else {
    return 'info';
  }
};

// Helper function to format error messages from API responses
export const formatApiErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.meta?.message) {
    return error.response.data.meta.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    if (error.message == "Anda sudah pernah membuat jadwal donor") {
      return "Anda sudah pernah membuat jadwal donor";
    }
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  return 'Terjadi kesalahan yang tidak diketahui';
};

// Predefined notification messages for common actions
export const NotificationMessages = {
  auth: {
    loginSuccess: { title: 'Login Berhasil', message: 'Selamat datang kembali!' },
    loginError: { title: 'Login Gagal', message: 'Email atau password tidak valid' },
    logoutSuccess: { title: 'Logout Berhasil', message: 'Anda telah keluar dari sistem' },
    registerSuccess: { title: 'Registrasi Berhasil', message: 'Akun Anda telah dibuat' },
    registerError: { title: 'Registrasi Gagal', message: 'Gagal membuat akun' },
  },
  campaign: {
    createSuccess: { title: 'Kampanye Dibuat', message: 'Kampanye baru berhasil dibuat' },
    createError: { title: 'Gagal Membuat Kampanye', message: 'Terjadi kesalahan saat membuat kampanye' },
    updateSuccess: { title: 'Kampanye Diperbarui', message: 'Kampanye berhasil diperbarui' },
    updateError: { title: 'Gagal Memperbarui', message: 'Terjadi kesalahan saat memperbarui kampanye' },
    deleteSuccess: { title: 'Kampanye Dihapus', message: 'Kampanye berhasil dihapus' },
    deleteError: { title: 'Gagal Menghapus', message: 'Terjadi kesalahan saat menghapus kampanye' },
  },
  donation: {
    success: { title: 'Donasi Berhasil', message: 'Terima kasih atas donasi Anda!' },
    error: { title: 'Donasi Gagal', message: 'Terjadi kesalahan saat memproses donasi' },
    pending: { title: 'Donasi Tertunda', message: 'Donasi Anda sedang diproses' },
  },
  profile: {
    updateSuccess: { title: 'Profil Diperbarui', message: 'Profil Anda berhasil diperbarui' },
    updateError: { title: 'Gagal Memperbarui Profil', message: 'Terjadi kesalahan saat memperbarui profil' },
  },
  general: {
    networkError: { title: 'Koneksi Bermasalah', message: 'Periksa koneksi internet Anda' },
    serverError: { title: 'Server Bermasalah', message: 'Terjadi kesalahan pada server' },
    validationError: { title: 'Data Tidak Valid', message: 'Periksa kembali data yang Anda masukkan' },
    unauthorized: { title: 'Akses Ditolak', message: 'Anda tidak memiliki izin untuk mengakses fitur ini' },
    forbidden: { title: 'Akses Dilarang', message: 'Anda tidak diizinkan mengakses resource ini' },
    notFound: { title: 'Tidak Ditemukan', message: 'Data yang Anda cari tidak ditemukan' },
  },
};

export default notificationManager; 