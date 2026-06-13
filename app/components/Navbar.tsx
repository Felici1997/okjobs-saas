'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300 fixed top-0 z-50 transition-all">
      <div className="navbar-start">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Okjobs" className="h-8 w-auto" />
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li><Link href="/" className="btn btn-ghost btn-sm">Accueil</Link></li>
          <li><Link href="/#features" className="btn btn-ghost btn-sm">Fonctionnalités</Link></li>
          <li><Link href="/#pricing" className="btn btn-ghost btn-sm">Tarifs</Link></li>
          <li><Link href="/api-docs" className="btn btn-ghost btn-sm">API</Link></li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {user ? (
          <Link href="/dashboard" className="btn btn-primary btn-sm hidden lg:inline-flex">
            Tableau de bord
          </Link>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost btn-sm hidden lg:inline-flex">
              Connexion
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm hidden lg:inline-flex">
              S&apos;inscrire
            </Link>
          </>
        )}
        <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5" /> : <Menu className="w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-base-100/95 backdrop-blur-md border-b border-base-300 shadow-lg">
          <ul className="menu menu-vertical p-4 gap-2">
            <li><Link href="/" onClick={() => setOpen(false)}>Accueil</Link></li>
            <li><Link href="/#features" onClick={() => setOpen(false)}>Fonctionnalités</Link></li>
            <li><Link href="/#pricing" onClick={() => setOpen(false)}>Tarifs</Link></li>
            <li><Link href="/api-docs" onClick={() => setOpen(false)}>API</Link></li>
            {user ? (
              <li><Link href="/dashboard" onClick={() => setOpen(false)} className="btn btn-primary btn-sm mt-2">Tableau de bord</Link></li>
            ) : (
              <>
                <li><Link href="/login" onClick={() => setOpen(false)}>Connexion</Link></li>
                <li><Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary btn-sm mt-2">S&apos;inscrire</Link></li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
