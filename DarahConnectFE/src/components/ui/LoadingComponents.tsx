import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, CheckCircleIcon } from 'lucide-react';
import clsx from 'clsx';

// Blood Drop Loading Animation
export const BloodDropLoader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={clsx('flex justify-center items-center', className)}>
      <motion.div
        className="relative w-8 h-12"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="w-8 h-8 bg-red-600 rounded-full absolute top-0"
          animate={{
            y: [0, 16, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="w-6 h-8 bg-red-600 absolute bottom-0 left-1"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          animate={{
            scaleY: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
};

// Heart Beat Loader
export const HeartBeatLoader: React.FC<{ className?: string; size?: number }> = ({ 
  className, 
  size = 40 
}) => {
  return (
    <div className={clsx('flex justify-center items-center', className)}>
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <HeartIcon 
          size={size} 
          className="text-red-500 fill-current" 
        />
      </motion.div>
    </div>
  );
};

// Skeleton Loader
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  width = '100%', 
  height = '1rem',
  rounded = false 
}) => {
  return (
    <motion.div
      className={clsx(
        'bg-gray-200',
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
      style={{ width, height }}
      animate={{
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Campaign Card Skeleton
export const CampaignCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton height="12rem" className="w-full" />
      
      <div className="p-6">
        {/* Title Skeleton */}
        <Skeleton height="1.5rem" width="80%" className="mb-3" />
        
        {/* Organizer Skeleton */}
        <div className="flex items-center mb-3">
          <Skeleton width="2rem" height="2rem" rounded className="mr-3" />
          <Skeleton width="8rem" height="1rem" />
        </div>
        
        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton height="1rem" width="100%" />
          <Skeleton height="1rem" width="90%" />
          <Skeleton height="1rem" width="70%" />
        </div>
        
        {/* Info Skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton height="1rem" width="85%" />
          <Skeleton height="1rem" width="75%" />
          <Skeleton height="1rem" width="65%" />
        </div>
        
        {/* Blood Types Skeleton */}
        <div className="mb-4">
          <Skeleton height="1rem" width="60%" className="mb-2" />
          <div className="flex gap-2">
            <Skeleton width="2.5rem" height="1.5rem" rounded />
            <Skeleton width="2.5rem" height="1.5rem" rounded />
            <Skeleton width="2.5rem" height="1.5rem" rounded />
          </div>
        </div>
        
        {/* Progress Skeleton */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <Skeleton width="5rem" height="1rem" />
            <Skeleton width="4rem" height="1rem" />
          </div>
          <Skeleton height="0.75rem" width="100%" rounded />
          <Skeleton width="3rem" height="0.75rem" className="mt-1" />
        </div>
        
        {/* Buttons Skeleton */}
        <div className="flex gap-3">
          <Skeleton height="2.5rem" width="50%" rounded />
          <Skeleton height="2.5rem" width="50%" rounded />
        </div>
      </div>
    </div>
  );
};

// Page Loading Overlay
interface PageLoadingProps {
  isLoading: boolean;
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ 
  isLoading, 
  message = 'Memuat data...' 
}) => {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <HeartBeatLoader size={60} className="mb-4" />
        <motion.p
          className="text-lg text-gray-600"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
};

// Spinner Loading
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'text-primary-600',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={clsx(sizeClasses[size], color, className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <svg 
        className="w-full h-full" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

// Dots Loading
export const DotsLoader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={clsx('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-primary-600 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// Loading Button
interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  onClick,
  disabled = false,
  className,
  loadingText = 'Loading...',
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={clsx(
        'relative overflow-hidden transition-all duration-200',
        className
      )}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        animate={{
          opacity: isLoading ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
      
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Spinner size="sm" color="text-current" className="mr-2" />
          <span>{loadingText}</span>
        </motion.div>
      )}
    </motion.button>
  );
};

// Homepage Loading Animation
interface HomepageLoaderProps {
  onComplete?: () => void;
}

export const HomepageLoader: React.FC<HomepageLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const messages = [
    'Memuat Komunitas Donor...',
    'Menyiapkan Campaign...',
    'Menghubungkan Hero...',
    'Siap Menyelamatkan Nyawa!'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 3; // Faster loading
        
        // Update message based on progress
        if (newProgress >= 25 && currentMessage === 0) setCurrentMessage(1);
        if (newProgress >= 50 && currentMessage === 1) setCurrentMessage(2);
        if (newProgress >= 75 && currentMessage === 2) setCurrentMessage(3);
        
        if (newProgress >= 100) {
          setIsComplete(true);
          setTimeout(() => {
            onComplete?.();
          }, 500); // Shorter delay
          clearInterval(timer);
          return 100;
        }
        
        return newProgress;
      });
    }, 60); // Faster interval

    return () => clearInterval(timer);
  }, [currentMessage, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={isComplete ? { opacity: 0, scale: 1.1 } : {}}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Simplified Background Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-300 rounded-full opacity-30"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Pulse Circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 2 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-80 h-80 border border-red-300 rounded-full opacity-20"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 1,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white">
        {/* Logo Animation */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1,
          }}
        >
          <div className="relative">
            {/* Heart Icon with Pulse */}
            <motion.div
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <HeartIcon className="w-12 h-12 text-primary-600 fill-current" />
            </motion.div>

            {/* Floating Blood Drops */}
            {Array.from({ length: 4 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-red-400 rounded-full opacity-60"
                style={{
                  left: `${50 + Math.cos((i * 90) * Math.PI / 180) * 50}px`,
                  top: `${50 + Math.sin((i * 90) * Math.PI / 180) * 50}px`,
                }}
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold mb-2">DarahConnect</h1>
          <p className="text-xl text-red-100 mb-8">Komunitas Donor Darah</p>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          className="w-80 mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {/* Progress Bar Container */}
          <div className="bg-white bg-opacity-20 rounded-full h-3 mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Progress Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                animate={{ x: [-100, 300] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>

          {/* Progress Text */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">{progress}%</span>
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-lg"
            >
              {messages[currentMessage]}
            </motion.div>
          </div>

          {/* Loading Hearts */}
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 3 }, (_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <HeartIcon className="w-6 h-6 text-red-300 fill-current" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Inspiring Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-8"
        >
          <p className="text-lg italic text-red-100">
            "Satu donasi dapat menyelamatkan hingga 3 nyawa"
          </p>
        </motion.div>

        {/* Completion Animation */}
        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="w-32 h-32 border-4 border-white rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                <CheckCircleIcon className="w-16 h-16 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}; 