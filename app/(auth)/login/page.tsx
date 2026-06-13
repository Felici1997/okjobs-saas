'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { signInSchema } from '@/lib/validations/auth';
import { IconEye, IconEyeOff, IconLogin } from '@tabler/icons-react';

export default function LoginPage() {
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
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold italic">
              <img src="/logo.png" alt="Okjobs" className="h-8 w-auto" />
            </h1>
            <p className="text-base-content/60 mt-2">Connectez-vous à votre compte</p>
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

            <div className="form-control">
              <label className="label">
                <span className="label-text">Mot de passe</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPwd ? <IconEyeOff className="w-4" /> : <IconEye className="w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error text-sm py-2">{error}</div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <IconLogin className="w-4" />
              )}
              Se connecter
            </button>
          </form>

          <div className="divider text-xs text-base-content/40">OU</div>

          <div className="flex flex-col items-center gap-3 text-sm">
            <Link href="/register" className="link link-primary">
              Créer un compte
            </Link>
            <Link href="/reset-password" className="link link-primary">
              Mot de passe oublié ?
            </Link>
            <Link href="/" className="link link-secondary text-xs mt-2">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
