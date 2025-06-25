import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Fade In Animation Component
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  direction = 'up',
  className 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  const directionOffset = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { y: 0, x: 60 },
    right: { y: 0, x: -60 },
  };

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration, delay }}
      variants={{
        hidden: { 
          opacity: 0, 
          ...directionOffset[direction]
        },
        visible: { 
          opacity: 1, 
          x: 0, 
          y: 0 
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Scale In Animation Component
interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  scale?: number;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  scale = 0.8,
  className 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Count Up Animation Component
interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export const CountUp: React.FC<CountUpProps> = ({ 
  end, 
  start = 0, 
  duration = 2, 
  delay = 0,
  className,
  suffix = '',
  prefix = ''
}) => {
  const [count, setCount] = useState(start);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      const increment = (end - start) / (duration * 60);
      const interval = setInterval(() => {
        setCount(prev => {
          const next = prev + increment;
          if (next >= end) {
            clearInterval(interval);
            return end;
          }
          return next;
        });
      }, 1000 / 60);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isInView, end, start, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}{Math.floor(count).toLocaleString()}{suffix}
    </span>
  );
};

// Stagger Container for sequential animations
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({ 
  children, 
  staggerDelay = 0.1,
  className 
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// Stagger Item for use within StaggerContainer
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className }) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {children}
    </motion.div>
  );
};

// Hover Scale Effect
interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export const HoverScale: React.FC<HoverScaleProps> = ({ 
  children, 
  scale = 1.05, 
  duration = 0.2,
  className 
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Floating Animation
interface FloatingProps {
  children: React.ReactNode;
  intensity?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export const Floating: React.FC<FloatingProps> = ({ 
  children, 
  intensity = 10, 
  duration = 3,
  delay = 0,
  className 
}) => {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Pulse Animation
interface PulseProps {
  children: React.ReactNode;
  scale?: [number, number];
  duration?: number;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({ 
  children, 
  scale = [1, 1.05], 
  duration = 2,
  className 
}) => {
  return (
    <motion.div
      animate={{
        scale,
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Typewriter Effect
interface TypewriterProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  delay = 0, 
  speed = 50,
  className 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        } else {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay, speed]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        |
      </motion.span>
    </span>
  );
};

// Slide In From Sides
interface SlideInProps {
  children: React.ReactNode;
  direction: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({ 
  children, 
  direction, 
  delay = 0, 
  duration = 0.6, 
  distance = 100,
  className 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const directionOffsets = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        ...directionOffsets[direction] 
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0 
      } : { 
        opacity: 0, 
        ...directionOffsets[direction] 
      }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Reveal on Scroll
interface RevealProps {
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({ 
  children, 
  threshold = 0.1,
  className 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 75 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 75 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Text Reveal Animation
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({ 
  text, 
  className,
  delay = 0 
}) => {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          style={{ marginRight: "5px" }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}; 