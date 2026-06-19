'use client';

import { useEffect, useState } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAllAffiliateCodes, getDisputedCodes, type AffiliateCodeWithDetails } from '@/lib/affiliate';
import { IconLoader2, IconSearch, IconAlertTriangle } from '@tabler/icons-react';

type DisputeRow = {
  id: string;
  reason: string;
  status: string;
  affiliate_codes: AffiliateCodeWithDetails;
};

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  generated: { label: 'Généré', color: '#F59E0B', bg: '#451A03' },
  sent: { label: 'Envoyé', color: '#3B82F6', bg: '#1E3A5F' },
  presented: { label: 'Présenté', color: '#8B5CF6', bg: '#3B1F8E' },
  converted: { label: 'Converti', color: '#10B981', bg: '#064E3B' },
  disputed: { label: 'Contesté', color: '#F87171', bg: '#7F1D1D' },
  expired: { label: 'Expiré', color: '#64748B', bg: '#1E293B' },
};

export default function AdminAffiliatePage() {
  const admin = createAdminClient();
  const [codes, setCodes] = useState<AffiliateCodeWithDetails[]>([]);
  const [disputes, setDisputes] = useState<(AffiliateCodeWithDetails & { dispute_id?: string; dispute_reason?: string })[]>([]);
  const [monthlyCommissions, setMonthlyCommissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    Promise.all([
      getAllAffiliateCodes(),
      getDisputedCodes(),
      admin
        .from('affiliate_codes')
        .select('commission_amount')
        .in('status', ['converted'])
        .gte('converted_at', startOfMonth),
    ]).then(([allCodes, disputedCodes, monthlyResult]) => {
      setCodes(allCodes);
      setDisputes(disputedCodes as unknown as (AffiliateCodeWithDetails & { dispute_id?: string; dispute_reason?: string })[]);
      setMonthlyCommissions(
        (monthlyResult.data || []).reduce((sum: number, c: { commission_amount: number }) => sum + (c.commission_amount || 0), 0)
      );
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleResolveDispute = async (codeId: string) => {
    await admin.from('affiliate_codes').update({ status: 'confirmed' }).eq('id', codeId);
    load();
  };

  const filtered = codes.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.training_centers?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#64748B' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F8FAFC', margin: '0 0 24px' }}>Affiliation</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', padding: '1rem' }}>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px' }}>Total codes</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>{codes.length}</p>
        </div>
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', padding: '1rem' }}>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px' }}>Conversions</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#10B981', margin: 0 }}>{codes.filter((c) => c.status === 'converted').length}</p>
        </div>
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', padding: '1rem' }}>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px' }}>Contestations</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#F87171', margin: 0 }}>{codes.filter((c) => c.status === 'disputed').length}</p>
        </div>
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', padding: '1rem' }}>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px' }}>Commissions du mois</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#F59E0B', margin: 0 }}>{monthlyCommissions.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      {disputes.length > 0 && (
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #7F1D1D', padding: '1.25rem', marginBottom: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#F87171', margin: '0 0 12px' }}>
            <IconAlertTriangle style={{ width: '16px', height: '16px' }} />
            Contestations en attente
          </h2>
          {disputes.map((d) => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #334155' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#F8FAFC', margin: 0 }}>Code {d.code}</p>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' }}>{d.user_confirmation === 'yes' ? 'Utilisateur confirme' : d.user_confirmation === 'no' ? 'Utilisateur refuse' : 'En attente confirmation'}</p>
              </div>
              <button onClick={() => handleResolveDispute(d.id)}
                style={{ fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '6px', border: 'none', background: '#10B981', color: '#fff', cursor: 'pointer' }}>
                Résoudre
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <IconSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748B' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par code, email ou centre..."
          style={{ width: '100%', padding: '10px 12px 10px 36px', fontSize: '13px', borderRadius: '8px', border: '0.5px solid #334155', background: '#1E293B', color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #334155' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Code</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Utilisateur</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Centre</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Programme</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Statut</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Commission</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const st = statusLabels[c.status] || statusLabels.generated;
                return (
                  <tr key={c.id} style={{ borderBottom: '0.5px solid #1E293B' }}>
                    <td style={{ padding: '12px 16px', color: '#F8FAFC', fontWeight: 500, fontFamily: 'monospace' }}>{c.code}</td>
                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px' }}>{c.profiles?.email || '-'}</td>
                    <td style={{ padding: '12px 16px', color: '#F8FAFC' }}>{c.training_centers?.name || '-'}</td>
                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px' }}>{c.training_programs?.title || '-'}</td>
                    <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 10px', borderRadius: '99px', background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', color: '#F8FAFC' }}>
                      {c.commission_amount ? `${c.commission_amount.toLocaleString('fr-FR')} FCFA` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
