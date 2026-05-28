import { useState, useEffect } from 'react';

const DEFAULT_EMOJIS = ['🛏️', '🧘', '🏃', '🥗'];
const DEFAULT_DURATION = 2000;

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
  emojis?: string[];
  duration?: number;
}

export function Spinner({
  size = 'sm',
  className = '',
  emojis = DEFAULT_EMOJIS,
  duration = DEFAULT_DURATION,
}: SpinnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (emojis.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % emojis.length);
    }, duration / emojis.length);

    return () => clearInterval(interval);
  }, [emojis.length, duration]);

  const sizeClasses = {
    sm: 'w-5 h-5 text-sm',
    md: 'w-8 h-8 text-lg',
    lg: 'w-12 h-12 text-2xl',
  };

  const style = typeof size === 'number' ? { width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.7}px` } : undefined;
  const classes = typeof size === 'string' ? sizeClasses[size] : '';

  return (
    <span
      aria-busy="true"
      role="status"
      className={`inline-flex items-center justify-center select-none ${classes} ${className}`}
      style={{
        ...style,
        animation: 'emoji-rotate 0.5s ease-in-out',
      }}
    >
      <span
        key={currentIndex}
        className="animate-emoji-fade"
        style={{
          display: 'inline-block',
        }}
      >
        {emojis[currentIndex]}
      </span>
      <span className="sr-only">Loading...</span>
    </span>
  );
}

