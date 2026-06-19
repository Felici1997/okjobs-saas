'use client';

import { useEffect, useState } from 'react';
import { apiAdmin } from '@/lib/admin-api';
import { IconPlus, IconEdit, IconCheck, IconX } from '@tabler/icons-react';

type Center = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  commission_pct: number;
  is_active: boolean;
  created_at: string;
};

const emptyForm = { name: '', address: '', phone: '', email: '', commission_pct: 10 };

export default function AdminCentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    apiAdmin({ table: 'training_centers', select: '*', orders: [{ column: 'created_at', ascending: false }] })
      .then(({ data }) => { if (data) setCenters(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    if (editingId) {
      await apiAdmin({ table: 'training_centers', method: 'update', set: form, whereCol: 'id', whereVal: editingId });
    } else {
      await apiAdmin({ table: 'training_centers', method: 'insert', data: form });
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (c: Center) => {
    setForm({ name: c.name, address: c.address || '', phone: c.phone || '', email: c.email || '', commission_pct: c.commission_pct });
    setEditingId(c.id);
    setShowForm(true);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await apiAdmin({ table: 'training_centers', method: 'update', set: { is_active: !current }, whereCol: 'id', whereVal: id });
    load();
  };

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div className="skeleton-pulse-dark" style={{ width: '200px', height: '24px' }} />
          <div className="skeleton-pulse-dark" style={{ width: '140px', height: '36px', borderRadius: '8px' }} />
        </div>
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', padding: '1.25rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-pulse-dark" style={{ width: '100%', height: '40px', marginBottom: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F8FAFC', margin: 0 }}>Centres de formation</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', cursor: 'pointer' }}>
          <IconPlus style={{ width: '14px', height: '14px' }} />
          Ajouter un centre
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', padding: '1.25rem', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#94A3B8', marginBottom: '4px' }}>Nom *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '0.5px solid #334155', background: '#0F172A', color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#94A3B8', marginBottom: '4px' }}>Adresse</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '0.5px solid #334155', background: '#0F172A', color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#94A3B8', marginBottom: '4px' }}>Téléphone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '0.5px solid #334155', background: '#0F172A', color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#94A3B8', marginBottom: '4px' }}>Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '0.5px solid #334155', background: '#0F172A', color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#94A3B8', marginBottom: '4px' }}>Commission (%)</label>
              <input type="number" value={form.commission_pct} onChange={(e) => setForm({ ...form, commission_pct: parseInt(e.target.value) || 0 })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '0.5px solid #334155', background: '#0F172A', color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
              style={{ fontSize: '13px', fontWeight: 500, padding: '7px 14px', borderRadius: '6px', border: '0.5px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving || !form.name}
              style={{ fontSize: '13px', fontWeight: 500, padding: '7px 14px', borderRadius: '6px', border: 'none', background: '#534AB7', color: '#fff', cursor: saving || !form.name ? 'not-allowed' : 'pointer', opacity: saving || !form.name ? 0.6 : 1 }}>
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#1E293B', borderRadius: '12px', border: '0.5px solid #334155', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #334155' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Nom</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Contact</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Commission</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Actif</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: '#64748B', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {centers.map((c) => (
                <tr key={c.id} style={{ borderBottom: '0.5px solid #1E293B' }}>
                  <td style={{ padding: '12px 16px', color: '#F8FAFC', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px' }}>
                    {c.phone && <div>{c.phone}</div>}
                    {c.email && <div>{c.email}</div>}
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 16px', color: '#F8FAFC' }}>{c.commission_pct}%</td>
                  <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <button onClick={() => toggleActive(c.id, c.is_active)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '99px', border: 'none', cursor: 'pointer', background: c.is_active ? '#064E3B' : '#7F1D1D', color: c.is_active ? '#6EE7B7' : '#FCA5A5' }}>
                      {c.is_active ? <IconCheck style={{ width: '12px', height: '12px' }} /> : <IconX style={{ width: '12px', height: '12px' }} />}
                      {c.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                    <button onClick={() => handleEdit(c)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '6px', border: '0.5px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}>
                      <IconEdit style={{ width: '12px', height: '12px' }} />
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
