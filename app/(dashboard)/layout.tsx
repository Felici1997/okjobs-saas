'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconLayoutDashboard, IconFileDescription, IconMessage2, IconHistory, IconKey, IconLogout, IconMenu2, IconChevronRight } from '@tabler/icons-react';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: IconLayoutDashboard },
  { href: '/cv', label: 'Mon CV', icon: IconFileDescription },
  { href: '/interview', label: 'Entretien', icon: IconMessage2 },
  { href: '/history', label: 'Historique', icon: IconHistory },
  { href: '/settings', label: 'Clés API', icon: IconKey },
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9FAFB' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#534AB7', animation: 'spin 0.6s linear infinite' }} />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F9FAFB' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col`} style={{ borderColor: '#E5E7EB' }}>

        <div style={{ padding: '1.25rem', borderBottom: '0.5px solid #E5E7EB' }}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Okjobs" className="h-7 w-auto" />
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', textDecoration: 'none',
                  background: isActive ? '#534AB7' : 'transparent',
                  color: isActive ? '#fff' : '#374151',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F3F4F6'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                <item.icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                {isActive && <IconChevronRight style={{ width: '14px', height: '14px', marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '0.5px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#534AB7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, flexShrink: 0 }}>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              <p style={{ fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '6px 10px', fontSize: '13px', fontWeight: 500, borderRadius: '6px', border: 'none', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
            <IconLogout style={{ width: '14px', height: '14px' }} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderBottom: '0.5px solid #E5E7EB' }} className="lg:hidden">
          <button onClick={() => setSidebarOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <IconMenu2 style={{ width: '18px', height: '18px' }} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Okjobs" className="h-7 w-auto" />
          </Link>
          <div style={{ width: '32px' }} />
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
