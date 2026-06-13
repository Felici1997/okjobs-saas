'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  History,
  Key,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/cv', label: 'Mon CV', icon: FileText },
  { href: '/interview', label: 'Entretien', icon: MessageSquare },
  { href: '/history', label: 'Historique', icon: History },
  { href: '/settings', label: 'Clés API', icon: Key },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-base-100 border-r border-base-300 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-base-300">
          <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/logo.png" alt="Okjobs" className="h-7 w-auto" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-content'
                    : 'hover:bg-base-300 text-base-content'
                }`}
              >
                <item.icon className="w-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div className="p-4 border-t border-base-300">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-8">
                <span className="text-xs">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="text-sm truncate flex-1">
              <p className="font-medium truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="btn btn-ghost btn-sm w-full justify-start gap-2"
          >
            <LogOut className="w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn btn-ghost btn-sm"
          >
            <Menu className="w-5" />
          </button>
          <span className="text-lg font-bold italic">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/logo.png" alt="Okjobs" className="h-7 w-auto" />
            </Link>
          </span>
          <div className="w-9" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
