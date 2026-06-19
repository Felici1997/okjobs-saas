'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { IconMail, IconArrowLeft } from '@tabler/icons-react';
import Spinner from '@/app/components/Spinner';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error: authError } = await resetPassword(email);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    setSuccess('Un email de réinitialisation vous a été envoyé.');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Link href="/">
            <img src="https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/Logo.jpg" alt="Okjobs" style={{ height: '28px', width: 'auto' }} />
          </Link>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0' }}>Réinitialisation du mot de passe</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>Email</label>
            <input type="email" placeholder="vous@exemple.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: '0.5px solid #D1D5DB', borderRadius: '8px', background: '#fff', color: '#111827' }}
              autoComplete="email" />
          </div>

          {error && <div style={{ background: '#FCEBEB', color: '#791F1F', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '0.5px solid #FCA5A5' }}>{error}</div>}
          {success && <div style={{ background: '#E1F5EE', color: '#085041', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '0.5px solid #A7D4C5' }}>{success}</div>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: 500, borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <Spinner size="sm" color="#fff" /> : null}
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#534AB7', textDecoration: 'underline' }}>
            <IconArrowLeft style={{ width: '14px', height: '14px' }} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
