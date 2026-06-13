'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { signUpSchema } from '@/lib/validations/auth';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = signUpSchema.safeParse({ email, password, fullName });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(email, password, fullName);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    setSuccess('Compte créé ! Vérifiez votre email pour confirmer l\'inscription.');
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold italic">
              <img src="/logo.png" alt="Okjobs" className="h-8 w-auto" />
            </h1>
            <p className="text-base-content/60 mt-2">Créez votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nom complet</span>
              </label>
              <input
                type="text"
                placeholder="Jean Dupont"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input input-bordered w-full"
                autoComplete="name"
              />
            </div>

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
                  placeholder="8 caractères minimum"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPwd ? <EyeOff className="w-4" /> : <Eye className="w-4" />}
                </button>
              </div>
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
                <UserPlus className="w-4" />
              )}
              Créer mon compte
            </button>
          </form>

          <div className="text-center mt-4 text-sm">
            Déjà un compte ?{' '}
            <Link href="/login" className="link link-primary">
              Se connecter
            </Link>
          </div>
          <div className="text-center mt-2 text-xs">
            <Link href="/" className="link link-secondary">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
