import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  XCircle
} from 'lucide-react';

interface EnhancedNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

const EnhancedNotification: React.FC<EnhancedNotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  isVisible
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
          borderColor: 'border-green-400',
          iconColor: 'text-green-100',
          textColor: 'text-white'
        };
      case 'error':
        return {
          icon: <XCircle className="w-6 h-6" />,
          bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
          borderColor: 'border-red-400',
          iconColor: 'text-red-100',
          textColor: 'text-white'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          bgColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
          borderColor: 'border-yellow-400',
          iconColor: 'text-yellow-100',
          textColor: 'text-white'
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6" />,
          bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
          borderColor: 'border-blue-400',
          iconColor: 'text-blue-100',
          textColor: 'text-white'
        };
      default:
        return {
          icon: <Info className="w-6 h-6" />,
          bgColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
          borderColor: 'border-gray-400',
          iconColor: 'text-gray-100',
          textColor: 'text-white'
        };
    }
  };

  const config = getTypeConfig();

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-500 ease-in-out ${
        isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-xl shadow-2xl overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${config.iconColor}`}>
              {config.icon}
            </div>
            
            <div className="ml-3 w-0 flex-1">
              <div className={`text-sm font-bold ${config.textColor} mb-1`}>
                {title}
              </div>
              <div className={`text-sm ${config.textColor} opacity-90 leading-relaxed`}>
                {message}
              </div>
            </div>
            
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={onClose}
                className={`inline-flex ${config.textColor} hover:bg-white/20 rounded-md p-1.5 transition-colors duration-200`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="bg-white/20 h-1 overflow-hidden">
          <div 
            className="bg-white h-full"
            style={{ 
              width: '100%',
              animation: `progressShrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes progressShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default EnhancedNotification; 