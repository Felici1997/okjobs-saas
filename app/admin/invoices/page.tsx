'use client';

import { useEffect, useState } from 'react';
import { apiAdmin } from '@/lib/admin-api';
import { IconLoader2, IconDownload, IconFileInvoice } from '@tabler/icons-react';

type Invoice = {
  id: string;
  invoice_number: string;
  training_center_id: string;
  total_amount: number;
  commission_amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  created_at: string;
  training_centers: { name: string };
};

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'En attente', color: '#F59E0B', bg: '#451A03' },
  paid: { label: 'Payée', color: '#10B981', bg: '#064E3B' },
  overdue: { label: 'En retard', color: '#F87171', bg: '#7F1D1D' },
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiAdmin({
      table: 'invoices',
      select: '*, training_centers!inner(name)',
      orders: [{ column: 'created_at', ascending: false }],
    }).then(({ data }) => {
      if (data) setInvoices(data as unknown as Invoice[]);
      setLoading(false);
    });
  }, []);

  const handleMarkPaid = async (id: string) => {
    await apiAdmin({ table: 'invoices', method: 'update', set: { status: 'paid', paid_at: new Date().toISOString() }, whereCol: 'id', whereVal: id });
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: 'paid', paid_at: new Date().toISOString() } : inv
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#64748B' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F8FAFC', margin: '0 0 24px' }}>Factures</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', padding: '1rem' }}>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px' }}>Total factures</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>{invoices.length}</p>
        </div>
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', padding: '1rem' }}>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px' }}>En attente</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#F59E0B', margin: 0 }}>{invoices.filter((i) => i.status === 'pending').length}</p>
        </div>
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', padding: '1rem' }}>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px' }}>Total commissions</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#10B981', margin: 0 }}>
            {invoices.reduce((s, i) => s + i.commission_amount, 0).toLocaleString('fr-FR')} FCFA
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155' }}>
          <IconFileInvoice style={{ width: '40px', height: '40px', color: '#334155', marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Aucune facture pour le moment</p>
        </div>
      ) : (
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid #334155' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Facture</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Centre</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Montant</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Commission</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Statut</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Échéance</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const st = statusStyles[inv.status] || statusStyles.pending;
                  return (
                    <tr key={inv.id} style={{ borderBottom: '0.5px solid #1E293B' }}>
                      <td style={{ padding: '12px 16px', color: '#F8FAFC', fontWeight: 500, fontFamily: 'monospace', fontSize: '12px' }}>{inv.invoice_number}</td>
                      <td style={{ padding: '12px 16px', color: '#94A3B8' }}>{inv.training_centers?.name || '-'}</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px', color: '#F8FAFC' }}>{inv.total_amount.toLocaleString('fr-FR')} FCFA</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px', color: '#F59E0B' }}>{inv.commission_amount.toLocaleString('fr-FR')} FCFA</td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 10px', borderRadius: '99px', background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 16px', color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(inv.due_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                        {inv.status === 'pending' && (
                          <button onClick={() => handleMarkPaid(inv.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#10B981', color: '#fff', cursor: 'pointer' }}>
                            <IconDownload style={{ width: '12px', height: '12px' }} />
                            Marquer payée
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
