import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon, 
  EyeOffIcon,
  ChevronDownIcon,
  SearchIcon,
  StarIcon,
  HeartIcon,
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon
} from 'lucide-react';
import { FadeIn, HoverScale, ScaleIn } from './AnimatedComponents';
import { MagneticButton, RippleEffect } from './AdvancedAnimations';
import clsx from 'clsx';

// Animated Input Component
interface AnimatedInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  icon,
  required = false,
  className
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={clsx('relative', className)}>
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}

        {/* Input */}
        <motion.input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={clsx(
            'w-full py-4 border-2 rounded-xl transition-all duration-300 focus:outline-none',
            icon ? 'pl-12 pr-4' : 'px-4',
            type === 'password' ? 'pr-12' : '',
            error 
              ? 'border-red-300 focus:border-red-500 bg-red-50' 
              : isFocused 
                ? 'border-primary-500 bg-white shadow-lg' 
                : 'border-gray-300 bg-gray-50',
            'text-gray-900'
          )}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        )}

        {/* Floating Label */}
        <motion.label
          className={clsx(
            'absolute left-3 pointer-events-none transition-all duration-300',
            icon ? 'left-12' : 'left-4',
            isFocused || value
              ? 'top-0 text-xs bg-white px-2 rounded text-primary-600 font-medium'
              : 'top-1/2 transform -translate-y-1/2 text-gray-500'
          )}
          animate={{
            y: isFocused || value ? -12 : 0,
            scale: isFocused || value ? 0.9 : 1,
          }}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </motion.label>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mt-2 text-red-600 text-sm"
        >
          <XCircleIcon className="w-4 h-4 mr-1" />
          {error}
        </motion.div>
      )}

      {/* Success State */}
      {!error && value && type !== 'password' && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
        </motion.div>
      )}
    </div>
  );
};

// Animated Select Component
interface AnimatedSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const AnimatedSelect: React.FC<AnimatedSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  error,
  className,
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      <div className="relative">
        {/* Select Button */}
        <motion.button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={clsx(
            'w-full py-4 px-4 border-2 rounded-xl text-left transition-all duration-300 focus:outline-none flex items-center justify-between',
            disabled 
              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              : error 
                ? 'border-red-300 bg-red-50' 
                : isOpen 
                  ? 'border-primary-500 bg-white shadow-lg' 
                  : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400',
            'text-gray-900'
          )}
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </motion.div>
        </motion.button>

        {/* Floating Label */}
        <motion.label
          className={clsx(
            'absolute left-4 pointer-events-none transition-all duration-300',
            isOpen || selectedOption
              ? 'top-0 text-xs bg-white px-2 rounded text-primary-600 font-medium -translate-y-3'
              : 'top-1/2 transform -translate-y-1/2 text-gray-500'
          )}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </motion.label>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-hidden"
        >
          {/* Search */}
          {options.length > 5 && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={clsx(
                    'w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-b-0',
                    value === option.value && 'bg-primary-100 text-primary-800 font-medium'
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                >
                  {option.label}
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-6 text-gray-500 text-center">
                <div className="text-sm">Tidak ada pilihan yang ditemukan</div>
                {searchTerm && (
                  <div className="text-xs mt-1">untuk "{searchTerm}"</div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mt-2 text-red-600 text-sm"
        >
          <XCircleIcon className="w-4 h-4 mr-1" />
          {error}
        </motion.div>
      )}
    </div>
  );
};

// Progress Stepper Component
interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className
}) => {
  return (
    <div className={clsx('flex items-center justify-between', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step */}
          <div className="flex flex-col items-center">
            <motion.button
              type="button"
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300',
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-300 text-gray-600',
                onStepClick && 'hover:scale-110 cursor-pointer'
              )}
              whileHover={onStepClick ? { scale: 1.1 } : {}}
              whileTap={onStepClick ? { scale: 0.95 } : {}}
            >
              {index < currentStep ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                index + 1
              )}
            </motion.button>
            
            <span className={clsx(
              'mt-2 text-xs font-medium text-center',
              index <= currentStep ? 'text-gray-900' : 'text-gray-500'
            )}>
              {step}
            </span>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div className="flex-1 mx-4">
              <div className="relative h-1 bg-gray-300 rounded">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-primary-600 rounded"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: index < currentStep ? '100%' : '0%' 
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Rating Component
interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  className
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={clsx('flex space-x-1', className)}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverValue || value);

        return (
          <motion.button
            key={index}
            type="button"
            onClick={() => !readonly && onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            disabled={readonly}
            className={clsx(
              'transition-colors duration-200',
              !readonly && 'hover:scale-110 cursor-pointer'
            )}
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
          >
            <StarIcon
              className={clsx(
                sizeClasses[size],
                isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
              )}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

// Toggle Switch Component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  size = 'md',
  className
}) => {
  const sizes = {
    sm: { switch: 'w-8 h-4', thumb: 'w-3 h-3' },
    md: { switch: 'w-12 h-6', thumb: 'w-5 h-5' },
    lg: { switch: 'w-16 h-8', thumb: 'w-7 h-7' }
  };

  return (
    <div className={clsx('flex items-center space-x-3', className)}>
      <motion.button
        type="button"
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative rounded-full transition-colors duration-300 focus:outline-none',
          sizes[size].switch,
          checked ? 'bg-primary-600' : 'bg-gray-300'
        )}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className={clsx(
            'absolute top-0.5 rounded-full bg-white shadow-md',
            sizes[size].thumb
          )}
          animate={{
            x: checked ? (size === 'sm' ? 16 : size === 'md' ? 24 : 32) : 2
          }}
          transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        />
      </motion.button>
      
      {label && (
        <span className="text-gray-700 font-medium">{label}</span>
      )}
    </div>
  );
};

// Gamified Progress Bar
interface GamifiedProgressProps {
  current: number;
  target: number;
  title: string;
  subtitle?: string;
  color?: string;
  showReward?: boolean;
  className?: string;
}

export const GamifiedProgress: React.FC<GamifiedProgressProps> = ({
  current,
  target,
  title,
  subtitle,
  color = 'primary',
  showReward = true,
  className
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isCompleted = current >= target;

  return (
    <div className={clsx('bg-white rounded-xl p-6 shadow-lg', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        
        {showReward && (
          <motion.div
            animate={isCompleted ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 1, repeat: isCompleted ? Infinity : 0, repeatDelay: 2 }}
          >
            <div className={clsx(
              'w-12 h-12 rounded-full flex items-center justify-center',
              isCompleted ? 'bg-yellow-400 text-yellow-800' : 'bg-gray-200 text-gray-400'
            )}>
              {isCompleted ? '🏆' : '🎯'}
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {current}/{target}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            className={clsx(
              'h-4 rounded-full',
              color === 'primary' ? 'bg-gradient-to-r from-primary-500 to-primary-600' :
              color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
              'bg-gradient-to-r from-gray-500 to-gray-600'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">{percentage.toFixed(1)}% completed</span>
          {isCompleted && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-medium text-green-600"
            >
              ✨ Completed!
            </motion.span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <MagneticButton
        className={clsx(
          'w-full py-3 rounded-lg font-medium transition-colors',
          isCompleted 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-primary-600 text-white hover:bg-primary-700'
        )}
        strength={0.2}
      >
        {isCompleted ? 'Claim Reward' : 'Continue Progress'}
      </MagneticButton>
    </div>
  );
}; 