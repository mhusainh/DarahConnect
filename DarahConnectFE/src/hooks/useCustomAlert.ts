import { useState, useCallback } from 'react';

interface AlertState {
  isVisible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
}

interface UseCustomAlertReturn {
  alertState: AlertState;
  showAlert: (config: Omit<AlertState, 'isVisible'>) => void;
  showSuccess: (title: string, message: string, actionButton?: AlertState['actionButton']) => void;
  showError: (title: string, message: string, actionButton?: AlertState['actionButton']) => void;
  showWarning: (title: string, message: string, actionButton?: AlertState['actionButton']) => void;
  showInfo: (title: string, message: string, actionButton?: AlertState['actionButton']) => void;
  hideAlert: () => void;
}

export const useCustomAlert = (): UseCustomAlertReturn => {
  const [alertState, setAlertState] = useState<AlertState>({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = useCallback((config: Omit<AlertState, 'isVisible'>) => {
    setAlertState({
      ...config,
      isVisible: true
    });
  }, []);

  const showSuccess = useCallback((title: string, message: string, actionButton?: AlertState['actionButton']) => {
    showAlert({ type: 'success', title, message, actionButton });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string, actionButton?: AlertState['actionButton']) => {
    showAlert({ type: 'error', title, message, actionButton });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, actionButton?: AlertState['actionButton']) => {
    showAlert({ type: 'warning', title, message, actionButton });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, actionButton?: AlertState['actionButton']) => {
    showAlert({ type: 'info', title, message, actionButton });
  }, [showAlert]);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  return {
    alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert
  };
}; 