'use client';

import { useEffect, useState } from 'react';
import { apiAdmin } from '@/lib/admin-api';
import { IconUsers, IconBuildingStore, IconAffiliate, IconCoin, IconArrowUp, IconLoader2 } from '@tabler/icons-react';

type Stats = {
  totalUsers: number;
  totalCenters: number;
  totalCodes: number;
  totalCommission: number;
  conversionsMonth: number;
  newUsersMonth: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    Promise.all([
      apiAdmin({ table: 'profiles', select: 'id' }),
      apiAdmin({ table: 'training_centers', select: 'id' }),
      apiAdmin({ table: 'affiliate_codes', select: 'id' }),
      apiAdmin({ table: 'affiliate_codes', select: 'commission_amount', filters: { status: 'converted' } }),
      apiAdmin({ table: 'affiliate_codes', select: 'id', filters: { status: 'converted', 'gte:converted_at': startOfMonth } }),
      apiAdmin({ table: 'profiles', select: 'id', filters: { 'gte:created_at': startOfMonth } }),
    ]).then(([users, centers, codes, commissions, conversions, newUsers]) => {
      const totalCommission = (commissions.data || []).reduce((sum: number, c: { commission_amount: number }) => sum + (c.commission_amount || 0), 0);
      setStats({
        totalUsers: users.count || 0,
        totalCenters: centers.count || 0,
        totalCodes: codes.count || 0,
        totalCommission,
        conversionsMonth: conversions.count || 0,
        newUsersMonth: newUsers.count || 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#64748B' }} />
      </div>
    );
  }

  const cards = [
    { label: 'Utilisateurs', value: stats?.totalUsers ?? 0, sub: `+${stats?.newUsersMonth ?? 0} ce mois`, icon: IconUsers, color: '#3B82F6' },
    { label: 'Centres partenaires', value: stats?.totalCenters ?? 0, icon: IconBuildingStore, color: '#10B981' },
    { label: 'Codes générés', value: stats?.totalCodes ?? 0, icon: IconAffiliate, color: '#8B5CF6' },
    { label: 'Commissions totales', value: `${(stats?.totalCommission ?? 0).toLocaleString('fr-FR')} FCFA`, sub: `${stats?.conversionsMonth ?? 0} conversions ce mois`, icon: IconCoin, color: '#F59E0B' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F8FAFC', margin: '0 0 24px' }}>Tableau de bord</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {cards.map((card) => (
          <div key={card.label} style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>{card.label}</span>
              <card.icon style={{ width: '20px', height: '20px', color: card.color }} />
            </div>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>{card.value}</p>
            {card.sub && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#10B981', margin: '4px 0 0' }}>
                <IconArrowUp style={{ width: '12px', height: '12px' }} />
                {card.sub}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
