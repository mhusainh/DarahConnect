import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertTriangleIcon, 
  InfoIcon,
  X,
  Bell,
  Volume2,
  VolumeX,
  ExternalLink,
  Link
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  showProgress?: boolean;
  actions?: NotificationAction[];
  dismissible?: boolean;
  persistent?: boolean;
  sound?: boolean;
  allowHtml?: boolean;
  links?: { text: string; url: string; external?: boolean }[];
  onClose: (id: string) => void;
  onAction?: (actionIndex: number) => void;
}

// Utility function to detect and render links in text
const renderMessageWithLinks = (text: string, allowHtml: boolean = false): React.ReactNode => {
  if (!text) return null;
  
  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  if (allowHtml) {
    // If HTML is allowed, check for links and render them
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        const isExternal = !part.includes(window.location.hostname);
        return (
          <a
            key={index}
            href={part}
            target={isExternal ? '_blank' : '_self'}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 transition-colors duration-200 inline-flex items-center gap-1"
          >
            {part}
            {isExternal && <ExternalLink className="h-3 w-3" />}
          </a>
        );
      }
      return part;
    });
  }
  
  return text;
};

// Component for rendering custom links
const NotificationLinks: React.FC<{
  links: { text: string; url: string; external?: boolean }[];
  textColor: string;
}> = ({ links, textColor }) => {
  if (!links || links.length === 0) return null;
  
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target={link.external ? '_blank' : '_self'}
          rel={link.external ? 'noopener noreferrer' : undefined}
          className={`
            inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md
            ${textColor} bg-white bg-opacity-60 hover:bg-opacity-80 
            transition-all duration-200 shadow-sm hover:shadow-md
            border border-current border-opacity-20
          `}
        >
          <Link className="h-3 w-3" />
          {link.text}
          {link.external && <ExternalLink className="h-3 w-3" />}
        </a>
      ))}
    </div>
  );
};

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  showProgress = true,
  actions = [],
  dismissible = true,
  persistent = false,
  sound = false,
  allowHtml = false,
  links = [],
  onClose,
  onAction,
}) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const closeRef = useRef<NodeJS.Timeout | null>(null);

  // Play sound effect
  useEffect(() => {
    if (sound) {
      // Create audio context for better browser support
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for different types
        const frequencies = {
          success: 800,
          error: 300,
          warning: 600,
          info: 500
        };
        
        oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.warn('Audio not supported in this browser');
      }
    }
  }, [sound, type]);

  // Show animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [onClose, id]);

  // Progress bar and auto-close
  useEffect(() => {
    if (persistent) return;

    const interval = 50;
    const decrement = (interval / duration) * 100;

    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    closeRef.current = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (closeRef.current) clearTimeout(closeRef.current);
    };
  }, [duration, persistent, handleClose]);



  const handleMouseEnter = () => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (closeRef.current) clearTimeout(closeRef.current);
  };

  const handleMouseLeave = () => {
    if (persistent) return;
    
    const remainingTime = (progress / 100) * duration;
    const interval = 50;
    const decrement = (interval / remainingTime) * progress;

    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    closeRef.current = setTimeout(() => {
      handleClose();
    }, remainingTime);
  };

  const handleActionClick = (actionIndex: number, action: NotificationAction) => {
    action.onClick();
    if (onAction) onAction(actionIndex);
    if (!persistent) handleClose();
  };

  // Enhanced styling configurations
  const typeConfig = {
    success: {
      bgColor: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
      borderColor: 'border-green-300 border-l-4 border-l-green-500',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
      progressColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: CheckCircleIcon,
      shadow: 'shadow-green-100',
    },
    error: {
      bgColor: 'bg-gradient-to-br from-red-50 via-rose-50 to-red-100',
      borderColor: 'border-red-300 border-l-4 border-l-red-500',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      progressColor: 'bg-gradient-to-r from-red-500 to-rose-500',
      icon: XCircleIcon,
      shadow: 'shadow-red-100',
    },
    warning: {
      bgColor: 'bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100',
      borderColor: 'border-yellow-300 border-l-4 border-l-yellow-500',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900',
      progressColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      icon: AlertTriangleIcon,
      shadow: 'shadow-yellow-100',
    },
    info: {
      bgColor: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100',
      borderColor: 'border-blue-300 border-l-4 border-l-blue-500',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
      progressColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      icon: InfoIcon,
      shadow: 'shadow-blue-100',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const baseClasses = `
    relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm
    transform transition-all duration-300 ease-out
    ${config.bgColor} ${config.borderColor} ${config.shadow}
  `;

  const animationClasses = isExiting
    ? 'translate-x-full opacity-0 scale-95'
    : isVisible
    ? 'translate-x-0 opacity-100 scale-100'
    : 'translate-x-full opacity-0 scale-95';

  return (
    <div 
      className={`${baseClasses} ${animationClasses}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Enhanced Progress Bar */}
      {showProgress && !persistent && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 bg-opacity-30">
          <div
            className={`h-full transition-all duration-75 ease-linear ${config.progressColor} shadow-sm`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="ml-3 flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${config.textColor}`}>
              {title}
            </h4>
            {message && (
              <div className={`mt-1 text-sm ${config.textColor} opacity-90 leading-relaxed`}>
                {renderMessageWithLinks(message, allowHtml)}
              </div>
            )}

            {/* Custom Links */}
            <NotificationLinks links={links} textColor={config.textColor} />

            {/* Actions */}
            {actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(index, action)}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200
                      ${action.variant === 'primary'
                        ? `${config.textColor} bg-white bg-opacity-80 hover:bg-opacity-100 shadow-sm`
                        : `${config.textColor} bg-transparent hover:bg-white hover:bg-opacity-50`
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Close Button */}
          {dismissible && (
            <button
              onClick={handleClose}
              className={`
                ml-4 flex-shrink-0 p-1 rounded-lg transition-colors duration-200
                text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300
              `}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Persistent indicator */}
      {persistent && (
        <div className="absolute bottom-2 right-2">
          <Bell className={`h-3 w-3 ${config.iconColor} opacity-50`} />
        </div>
      )}
    </div>
  );
};

// Enhanced Notification Container with better stacking
export interface NotificationContainerProps {
  notifications: NotificationProps[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
  position = 'top-right',
  maxNotifications = 5,
}) => {
  const visibleNotifications = notifications.slice(0, maxNotifications);
  const hiddenCount = notifications.length - maxNotifications;

  if (notifications.length === 0) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-sm w-full`}>
      <div className="space-y-3">
        {visibleNotifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              transform: `scale(${1 - index * 0.02}) translateY(${index * -4}px)`,
              zIndex: 1000 - index,
            }}
          >
            <Notification
              {...notification}
              onClose={onClose}
            />
          </div>
        ))}
        
        {/* Show count of hidden notifications */}
        {hiddenCount > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-2 bg-gray-800 text-white text-xs rounded-full shadow-lg">
              +{hiddenCount} notifikasi lainnya
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced notification builders with new features
export const createSuccessNotification = (
  title: string, 
  message?: string, 
  options?: Partial<NotificationProps>
): Omit<NotificationProps, 'id' | 'onClose'> => ({
  type: 'success',
  title,
  message,
  duration: 4000,
  showProgress: true,
  sound: true,
  allowHtml: false,
  links: [],
  ...options,
});

export const createErrorNotification = (
  title: string, 
  message?: string, 
  options?: Partial<NotificationProps>
): Omit<NotificationProps, 'id' | 'onClose'> => ({
  type: 'error',
  title,
  message,
  duration: 6000,
  showProgress: true,
  sound: true,
  persistent: false,
  allowHtml: false,
  links: [],
  ...options,
});

export const createWarningNotification = (
  title: string, 
  message?: string, 
  options?: Partial<NotificationProps>
): Omit<NotificationProps, 'id' | 'onClose'> => ({
  type: 'warning',
  title,
  message,
  duration: 5000,
  showProgress: true,
  allowHtml: false,
  links: [],
  ...options,
});

export const createInfoNotification = (
  title: string, 
  message?: string, 
  options?: Partial<NotificationProps>
): Omit<NotificationProps, 'id' | 'onClose'> => ({
  type: 'info',
  title,
  message,
  duration: 4000,
  showProgress: true,
  allowHtml: false,
  links: [],
  ...options,
});

// New specialized notification builders
export const createNotificationWithLinks = (
  type: NotificationType,
  title: string,
  message: string,
  links: { text: string; url: string; external?: boolean }[],
  options?: Partial<NotificationProps>
): Omit<NotificationProps, 'id' | 'onClose'> => ({
  type,
  title,
  message,
  duration: 6000,
  showProgress: true,
  allowHtml: false,
  links,
  ...options,
});

export const createHtmlNotification = (
  type: NotificationType,
  title: string,
  message: string,
  options?: Partial<NotificationProps>
): Omit<NotificationProps, 'id' | 'onClose'> => ({
  type,
  title,
  message,
  duration: 5000,
  showProgress: true,
  allowHtml: true,
  links: [],
  ...options,
});

export default Notification; 