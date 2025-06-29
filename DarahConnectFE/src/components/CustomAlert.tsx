import React, { useState, useEffect } from 'react';

interface CustomAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showIcon?: boolean;
  actionButton?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  showIcon = true,
  actionButton
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          iconColor: 'text-green-400',
          buttonPrimary: 'bg-green-600 hover:bg-green-700',
          buttonSecondary: 'bg-green-100 text-green-800 hover:bg-green-200'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          iconColor: 'text-red-400',
          buttonPrimary: 'bg-red-600 hover:bg-red-700',
          buttonSecondary: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          iconColor: 'text-yellow-400',
          buttonPrimary: 'bg-yellow-600 hover:bg-yellow-700',
          buttonSecondary: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          iconColor: 'text-blue-400',
          buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
          buttonSecondary: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700',
          iconColor: 'text-gray-400',
          buttonPrimary: 'bg-gray-600 hover:bg-gray-700',
          buttonSecondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const styles = getAlertStyles();

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Alert Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`max-w-md w-full transform transition-all duration-300 ${
            isAnimating 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-xl overflow-hidden`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {showIcon && (
                    <div className={`flex-shrink-0 ${styles.iconColor}`}>
                      {getIcon()}
                    </div>
                  )}
                  <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
                    {title}
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className={`text-sm leading-relaxed ${styles.messageColor}`}>
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              {actionButton && (
                <button
                  onClick={() => {
                    actionButton.onClick();
                    handleClose();
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                    actionButton.variant === 'secondary' 
                      ? styles.buttonSecondary 
                      : styles.buttonPrimary
                  }`}
                >
                  {actionButton.text}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomAlert; 