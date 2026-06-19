'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { signInSchema } from '@/lib/validations/auth';
import { IconEye, IconEyeOff, IconShieldLock } from '@tabler/icons-react';
import Spinner from '@/app/components/Spinner';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError('Email ou mot de passe incorrect');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/admin/check');
    const data = await res.json();
    if (!data.isAdmin) {
      setError('Accès non autorisé');
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', background: '#1E293B', marginBottom: '16px' }}>
            <IconShieldLock style={{ width: '24px', height: '24px', color: '#534AB7' }} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F8FAFC', margin: '0 0 4px' }}>Admin Okjobs</h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Connectez-vous pour gérer la plateforme</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ fontSize: '13px', color: '#F87171', padding: '10px 12px', borderRadius: '8px', background: '#1E293B', border: '0.5px solid #7F1D1D' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#94A3B8', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@okjobs.cd"
              style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '0.5px solid #334155', background: '#1E293B', color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#534AB7'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#334155'} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#94A3B8', marginBottom: '6px' }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '0.5px solid #334155', background: '#1E293B', color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#534AB7'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}>
                {showPwd ? <IconEyeOff style={{ width: '16px', height: '16px' }} /> : <IconEye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: 500, borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <Spinner size="sm" color="#fff" /> : null}
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/login" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
