import { useState, useEffect, useRef } from 'react';

// Hook untuk Intersection Observer Lazy Loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { elementRef, isIntersecting, hasIntersected };
};

// Hook untuk lazy loading images
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { elementRef, hasIntersected } = useIntersectionObserver();

  useEffect(() => {
    if (!hasIntersected) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setIsError(true);
    };
    img.src = src;
  }, [src, hasIntersected]);

  return {
    elementRef,
    imageSrc,
    isLoaded,
    isError,
    hasIntersected
  };
};

// Hook untuk lazy loading components
export const useLazyComponent = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px'
  });

  useEffect(() => {
    if (hasIntersected) {
      setShouldLoad(true);
    }
  }, [hasIntersected]);

  return {
    elementRef,
    shouldLoad,
    hasIntersected
  };
};

// Hook untuk preloading
export const usePreload = (urls: string[]) => {
  const [preloadedUrls, setPreloadedUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadPromises = urls.map(url => {
      return new Promise<string>((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.onload = () => resolve(url);
        link.onerror = () => reject(url);
        document.head.appendChild(link);
      });
    });

    Promise.allSettled(preloadPromises).then(results => {
      const loaded = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<string>).value);
      
      setPreloadedUrls(new Set(loaded));
    });
  }, [urls]);

  return preloadedUrls;
};

// Hook untuk performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(Date.now());
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;
    setLoadTime(duration);

    // Log ke console untuk development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [LazyLoad] ${componentName} loaded in ${duration}ms`);
    }

    // Bisa dikirim ke analytics service
    // analytics.track('component_load_time', {
    //   component: componentName,
    //   loadTime: duration
    // });
  }, [componentName]);

  return loadTime;
};

// Hook untuk retry loading dengan exponential backoff
export const useRetryLoading = (
  asyncFunction: () => Promise<any>,
  maxRetries: number = 3
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setRetryCount(0);
      return result;
    } catch (err) {
      const error = err as Error;
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          execute();
        }, delay);
      } else {
        setError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    setRetryCount(0);
    execute();
  };

  return {
    execute,
    retry,
    isLoading,
    error,
    retryCount,
    canRetry: retryCount < maxRetries
  };
}; 