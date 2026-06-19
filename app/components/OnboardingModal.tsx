'use client';

import { useState, useCallback } from 'react';
import { IconX } from '@tabler/icons-react';

interface Slide {
  title: string;
  description: string;
  illustration: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  slides: Slide[];
  onDismiss: () => void;
  onStart: () => void;
  startLabel?: string;
}

export default function OnboardingModal({ isOpen, slides, onDismiss, onStart, startLabel = 'Commencer' }: OnboardingModalProps) {
  const [current, setCurrent] = useState(0);
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setCurrent(0);
      onDismiss();
    }, 200);
  }, [onDismiss]);

  const handleStart = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setCurrent(0);
      onStart();
    }, 200);
  }, [onStart]);

  if (!isOpen) return null;

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      animation: closing ? 'fadeOut 0.2s ease' : 'fadeIn 0.25s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', maxWidth: '400px', width: '90%',
        maxHeight: '90vh', overflow: 'hidden', position: 'relative',
        animation: closing ? 'scaleOut 0.2s ease' : 'scaleIn 0.25s ease',
      }}>
        <button onClick={handleClose} style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 10,
          width: '32px', height: '32px', borderRadius: '50%', border: 'none',
          background: '#F3F4F6', color: '#6B7280', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconX style={{ width: '16px', height: '16px' }} />
        </button>

        <div style={{ padding: '2rem 1.5rem 0', textAlign: 'center' }}>
          <img src={slide.illustration} alt="" style={{ width: '200px', height: '150px', objectFit: 'contain', margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>{slide.title}</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: '0 0 1.5rem' }}>{slide.description}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '1.25rem' }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? '24px' : '8px', height: '8px', borderRadius: '99px',
              border: 'none', background: i === current ? '#534AB7' : '#D1D5DB',
              cursor: 'pointer', transition: 'all 0.2s', padding: 0,
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', padding: '0 1.5rem 1.5rem' }}>
          {current > 0 && (
            <button onClick={() => setCurrent(current - 1)} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: '0.5px solid #D1D5DB',
              background: 'transparent', color: '#374151', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            }}>
              ← Précédent
            </button>
          )}
          {isLast ? (
            <button onClick={handleStart} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: '#534AB7', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            }}>
              {startLabel}
            </button>
          ) : (
            <button onClick={() => setCurrent(current + 1)} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: '#534AB7', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            }}>
              Suivant →
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes scaleOut { from { transform: scale(1); opacity: 1; } to { transform: scale(0.95); opacity: 0; } }
      `}</style>
    </div>
  );
}
