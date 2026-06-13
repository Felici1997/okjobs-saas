'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { IconMail, IconArrowLeft } from '@tabler/icons-react';

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
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold italic">
              <img src="/logo.png" alt="Okjobs" className="h-8 w-auto" />
            </h1>
            <p className="text-base-content/60 mt-2">Réinitialisation du mot de passe</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full"
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="alert alert-error text-sm py-2">{error}</div>
            )}
            {success && (
              <div className="alert alert-success text-sm py-2">{success}</div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <IconMail className="w-4" />
              )}
              Envoyer
            </button>
          </form>

          <div className="text-center mt-4">
            <Link href="/login" className="link link-primary text-sm flex items-center justify-center gap-1">
              <IconArrowLeft className="w-3" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
