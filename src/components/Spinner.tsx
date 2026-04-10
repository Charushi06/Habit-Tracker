import { useState, useEffect } from 'react';

const EMOJIS = ['🛏️', '🧘', '🏃', '🥗'];
const ANIMATION_DURATION = 2000; // 2 seconds for full cycle

export function Spinner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % EMOJIS.length);
    }, ANIMATION_DURATION / EMOJIS.length);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      aria-busy="true"
      role="status"
      className="inline-flex items-center justify-center w-5 h-5"
      style={{
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
        {EMOJIS[currentIndex]}
      </span>
      <span className="sr-only">Loading...</span>
    </span>
  );
}
