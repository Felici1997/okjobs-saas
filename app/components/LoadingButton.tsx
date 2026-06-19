'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  icon?: ReactNode;
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
};

const variantStyles: Record<Variant, Record<string, string>> = {
  primary: {
    background: '#534AB7',
    color: '#fff',
    border: 'none',
    hoverBg: '#473E9E',
  },
  secondary: {
    background: 'transparent',
    color: '#374151',
    border: '0.5px solid #D1D5DB',
    hoverBg: '#F3F4F6',
  },
  ghost: {
    background: 'transparent',
    color: '#6B7280',
    border: 'none',
    hoverBg: '#F3F4F6',
  },
  danger: {
    background: '#DC2626',
    color: '#fff',
    border: 'none',
    hoverBg: '#B91C1C',
  },
};

const variantAdminStyles: Record<Variant, Record<string, string>> = {
  primary: {
    background: '#534AB7',
    color: '#fff',
    border: 'none',
    hoverBg: '#473E9E',
  },
  secondary: {
    background: 'transparent',
    color: '#94A3B8',
    border: '0.5px solid #334155',
    hoverBg: '#334155',
  },
  ghost: {
    background: 'transparent',
    color: '#94A3B8',
    border: 'none',
    hoverBg: '#334155',
  },
  danger: {
    background: '#DC2626',
    color: '#fff',
    border: 'none',
    hoverBg: '#B91C1C',
  },
};

export default function LoadingButton({
  loading = false,
  icon,
  variant = 'primary',
  children,
  fullWidth = false,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: Props) {
  const isDark = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const vs = isDark ? variantAdminStyles[variant] : variantStyles[variant];

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        textDecoration: 'none', whiteSpace: 'nowrap', boxSizing: 'border-box',
        transition: 'background 0.15s, opacity 0.15s',
        ...vs,
        ...(fullWidth ? { width: '100%' } : {}),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && vs.hoverBg) {
          e.currentTarget.style.background = vs.hoverBg;
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading && vs.background) {
          e.currentTarget.style.background = vs.background;
        }
        onMouseLeave?.(e);
      }}
      {...rest}
    >
      {loading ? <Spinner size="sm" color={vs.color} /> : icon}
      {children}
    </button>
  );
}
