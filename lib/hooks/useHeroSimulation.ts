'use client';

import { useState, useEffect, useRef } from 'react';

const QUESTION = "Pouvez-vous m'expliquer comment vous gérez les appels asynchrones en JavaScript ?";
const TOTAL_SECONDS = 272;
const TYPING_SPEED = 35;
const LOOP_PAUSE = 3000;

type Phase = 'idle' | 'typing' | 'countdown' | 'pausing';

export function useHeroSimulation() {
  const [phase, setPhase] = useState<Phase>('typing');
  const [typedChars, setTypedChars] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const progress = TOTAL_SECONDS > 0 ? ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100 : 0;
  const phaseRef = useRef<Phase>('typing');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Phase 1: Typing
  useEffect(() => {
    if (phase !== 'typing') return;
    if (typedChars >= QUESTION.length) {
      const t = setTimeout(() => setPhase('countdown'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTypedChars((c) => c + 1), TYPING_SPEED);
    return () => clearTimeout(t);
  }, [phase, typedChars]);

  // Phase 2: Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    // start countdown on next tick so UI shows full text first
    const startT = setTimeout(() => {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setPhase('pausing');
            return TOTAL_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, 100);
    return () => clearTimeout(startT);
  }, [phase]);

  // Phase 3: Pause then loop
  useEffect(() => {
    if (phase !== 'pausing') return;
    const t = setTimeout(() => {
      setTypedChars(0);
      setSecondsLeft(TOTAL_SECONDS);
      setPhase('typing');
    }, LOOP_PAUSE);
    return () => clearTimeout(t);
  }, [phase]);

  const displayTime = formatTime(secondsLeft);

  const timerColor =
    secondsLeft > 120
      ? 'text-brand-blue'
      : secondsLeft > 60
        ? 'text-brand-yellow'
        : 'text-red-500';

  const typedText = QUESTION.slice(0, typedChars);

  return {
    typedText,
    isTyping: phase === 'typing',
    displayTime,
    timerColor,
    progress,
    isComplete: phase === 'countdown' || phase === 'pausing',
  };
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
