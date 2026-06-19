'use client';

import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconLoader2, IconLogout, IconLayoutDashboard, IconBuildingStore, IconAffiliate, IconFileInvoice, IconUsers, IconMenu2, IconChevronRight } from '@tabler/icons-react';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: IconLayoutDashboard },
  { href: '/admin/centers', label: 'Centres', icon: IconBuildingStore },
  { href: '/admin/affiliate', label: 'Affiliation', icon: IconAffiliate },
  { href: '/admin/invoices', label: 'Factures', icon: IconFileInvoice },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from('profiles')
        .select('is_admin, email')
        .eq('id', user.id)
        .single();
      if (!profile?.is_admin) {
        router.push('/dashboard');
        return;
      }
      setAdminEmail(profile.email || null);
      setIsAdmin(true);
      setLoading(false);
    });
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
        <IconLoader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#fff' }} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1E293B] border-r transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col`} style={{ borderColor: '#334155' }}>

        <div style={{ padding: '1.25rem', borderBottom: '0.5px solid #334155' }}>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#F8FAFC' }}>Okjobs Admin</span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', textDecoration: 'none',
                  background: isActive ? '#334155' : 'transparent',
                  color: isActive ? '#fff' : '#94A3B8',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#334155'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                <item.icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                {isActive && <IconChevronRight style={{ width: '14px', height: '14px', marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '0.5px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#534AB7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, flexShrink: 0 }}>
              {adminEmail?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              <p style={{ fontWeight: 500, color: '#F8FAFC', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminEmail}</p>
              <p style={{ color: '#94A3B8', margin: 0, fontSize: '11px' }}>Admin</p>
            </div>
          </div>
          <button onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '6px 10px', fontSize: '13px', fontWeight: 500, borderRadius: '6px', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#334155'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
            <IconLogout style={{ width: '14px', height: '14px' }} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#1E293B', borderBottom: '0.5px solid #334155' }} className="lg:hidden">
          <button onClick={() => setSidebarOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <IconMenu2 style={{ width: '18px', height: '18px', color: '#fff' }} />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>Okjobs Admin</span>
          <div style={{ width: '32px' }} />
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
