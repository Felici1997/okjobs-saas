'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  to: number;
  duration?: number;
}

export default function AnimatedCounter({ to, duration = 800 }: Props) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          started.current = true;
          observer.unobserve(el);
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(eased * to));
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{value.toString().padStart(2, '0')}</span>;
}
