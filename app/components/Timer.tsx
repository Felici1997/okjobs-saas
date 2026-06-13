'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

type Props = {
  minutes: number;
  onExpired: () => void;
};

export default function Timer({ minutes, onExpired }: Props) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const expiredRef = useRef(false);

  const handleExpired = useCallback(() => {
    if (!expiredRef.current) {
      expiredRef.current = true;
      onExpired();
    }
  }, [onExpired]);

  useEffect(() => {
    if (minutes === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [minutes, handleExpired]);

  if (minutes === 0) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isLow = timeLeft < 60;

  return (
    <div
      className={`badge badge-lg gap-2 ${
        isLow ? 'badge-error animate-pulse' : 'badge-ghost'
      }`}
    >
      <svg className="w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2" />
        <path d="M12 5V3" />
        <path d="M10 19l-2 3" />
        <path d="M14 19l2 3" />
      </svg>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}
