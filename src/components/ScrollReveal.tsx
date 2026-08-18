import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: string;
  duration?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  distance = '20px',
  duration = 0.5,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      setIsVisible(true);
      return;
    }

    // Safety fallback so content is NEVER stuck invisible on Safari / Mobile
    const safetyTimer = setTimeout(() => {
      setIsVisible(true);
    }, 150);

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return () => clearTimeout(safetyTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
          clearTimeout(safetyTimer);
        }
      },
      {
        threshold: 0.01,
        rootMargin: '120px 0px 50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      clearTimeout(safetyTimer);
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${distance})`,
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};
