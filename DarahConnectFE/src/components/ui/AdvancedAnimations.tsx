import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';
import clsx from 'clsx';

// Magnetic Button Component
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
  disabled?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className, 
  onClick,
  strength = 0.4,
  disabled = false
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// Gradient Background
interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  children, 
  className,
  animated = true 
}) => {
  return (
    <motion.div
      className={clsx(
        'relative overflow-hidden',
        className
      )}
      animate={animated ? {
        background: [
          'linear-gradient(45deg, #dc2626, #b91c1c)',
          'linear-gradient(135deg, #ef4444, #dc2626)',
          'linear-gradient(225deg, #f87171, #dc2626)',
          'linear-gradient(315deg, #dc2626, #991b1b)',
          'linear-gradient(45deg, #dc2626, #b91c1c)',
        ],
      } : {}}
      transition={animated ? {
        duration: 10,
        repeat: Infinity,
        ease: "linear",
      } : {}}
    >
      {children}
    </motion.div>
  );
};

// Parallax Component
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({ 
  children, 
  speed = 0.5,
  className 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [elementTop, setElementTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onScroll = () => {
      setElementTop(element.getBoundingClientRect().top);
      setClientHeight(window.innerHeight);
    };

    const handleResize = () => {
      setClientHeight(window.innerHeight);
    };

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', handleResize);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const y = useTransform(
    () => (elementTop + clientHeight) * speed
  );

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Morphing Shape
interface MorphingShapeProps {
  className?: string;
  size?: number;
  color?: string;
}

export const MorphingShape: React.FC<MorphingShapeProps> = ({ 
  className,
  size = 100,
  color = '#FF6B6B'
}) => {
  return (
    <motion.div
      className={clsx('rounded-full', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
      animate={{
        scale: [1, 1.2, 0.8, 1],
        rotate: [0, 180, 360],
        borderRadius: ['50%', '25%', '50%'],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Glitch Effect
interface GlitchTextProps {
  text: string;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className }) => {
  return (
    <motion.div className={clsx('relative', className)}>
      <motion.span
        animate={{
          x: [0, -1, 1, 0],
          textShadow: [
            '0 0 0 transparent',
            '2px 0 0 #ff0000',
            '-2px 0 0 #00ff00',
            '0 0 0 transparent'
          ],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
};

// Particle Background
interface ParticleBackgroundProps {
  particleCount?: number;
  className?: string;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  particleCount = 50,
  className 
}) => {
  const particles = Array.from({ length: particleCount }, (_, i) => i);

  return (
    <div className={clsx('absolute inset-0 overflow-hidden', className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-white rounded-full opacity-60"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Bouncing Loader
interface BouncingLoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

export const BouncingLoader: React.FC<BouncingLoaderProps> = ({ 
  size = 12,
  color = '#FF6B6B',
  className 
}) => {
  const bounceTransition = {
    y: {
      duration: 0.4,
      yoyo: Infinity,
      ease: "easeOut",
    },
  };

  return (
    <div className={clsx('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{
            y: ["0%", "-100%", "0%"],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.1,
          }}
          style={{
            width: size,
            height: size,
            backgroundColor: color,
          }}
          className="rounded-full"
        />
      ))}
    </div>
  );
};

// Ripple Effect
interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({ 
  children, 
  className,
  color = 'rgba(255, 255, 255, 0.6)' 
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <div
      className={clsx('relative overflow-hidden', className)}
      onClick={handleClick}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          initial={{ opacity: 1, scale: 0 }}
          animate={{ opacity: 0, scale: 4 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}; 