'use client';

import Link from 'next/link';
import { useState } from 'react';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useAuth } from '@/lib/contexts/auth-context';

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/Logo.jpg" alt="Okjobs" className="h-8 w-auto" />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          <Link href="/" className="px-3 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors">Accueil</Link>
          <Link href="/#features" className="px-3 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors">Fonctionnalités</Link>
          <Link href="/recruiters" className="px-3 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors">Recruteurs</Link>
          <Link href="/#pricing" className="px-3 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors">Tarifs</Link>
          <Link href="/api-docs" className="px-3 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors">API</Link>
          <Link href="/blog" className="px-3 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors">Blog</Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2 text-sm font-semibold text-white transition-colors"
              style={{ background: '#009fe1' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#0088cc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#009fe1'; }}
            >
              Tableau de bord
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors">
                Connexion
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-semibold text-white transition-colors"
                style={{ background: '#009fe1' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#0088cc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#009fe1'; }}
              >
                Démo
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden btn btn-ghost btn-sm" onClick={() => setOpen(!open)}>
          {open ? <IconX className="w-5" /> : <IconMenu2 className="w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-black/5 shadow-lg">
          <div className="px-6 py-4 flex flex-col gap-2">
            <Link href="/" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-black/60 hover:text-black">Accueil</Link>
            <Link href="/#features" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-black/60 hover:text-black">Fonctionnalités</Link>
            <Link href="/recruiters" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-black/60 hover:text-black">Recruteurs</Link>
            <Link href="/#pricing" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-black/60 hover:text-black">Tarifs</Link>
            <Link href="/api-docs" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-black/60 hover:text-black">API</Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-black/60 hover:text-black">Blog</Link>
            <div className="border-t border-black/5 mt-2 pt-3 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/dashboard"
                  className="text-center py-2 text-sm font-semibold text-white"
                  style={{ background: '#009fe1' }}
                  onClick={() => setOpen(false)}
                >
                  Tableau de bord
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="text-center py-2 text-sm font-medium text-black/60">Connexion</Link>
                  <Link
                    href="/register"
                    className="text-center py-2 text-sm font-semibold text-white"
                    style={{ background: '#009fe1' }}
                    onClick={() => setOpen(false)}
                  >
                    Démo
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
