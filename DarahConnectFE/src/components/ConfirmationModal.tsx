import React from 'react';
import { 
  X, 
  AlertTriangle, 
  Trash2,
  CheckCircle,
  Info
} from 'lucide-react';
import { FadeIn } from './ui/AnimatedComponents';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  loading = false
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="w-12 h-12 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          iconBg: 'bg-yellow-100'
        };
      case 'info':
        return {
          icon: <Info className="w-12 h-12 text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          iconBg: 'bg-blue-100'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          confirmBg: 'bg-green-600 hover:bg-green-700',
          iconBg: 'bg-green-100'
        };
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          iconBg: 'bg-red-100'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <FadeIn>
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header with colored background */}
          <div className={`${config.bgColor} ${config.borderColor} border-b px-6 py-8 text-center`}>
            <div className={`${config.iconBg} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
              {config.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 py-6 bg-gray-50">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-6 py-3 ${config.confirmBg} text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </FadeIn>
    </div>
  );
};

export default ConfirmationModal; 