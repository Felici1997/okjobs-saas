'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingButton from '@/app/components/LoadingButton';
import { IconAlertCircle } from '@tabler/icons-react';

const categories = [
  { value: 'logique', label: 'Raisonnement logique', desc: 'Séries, analogies, déductions' },
  { value: 'math', label: 'Calcul mathématique', desc: 'Problèmes numériques, calcul mental' },
  { value: 'verbal', label: 'Compréhension verbale', desc: 'Vocabulaire, analogies verbales' },
  { value: 'spatial', label: 'Raisonnement spatial', desc: 'Rotation mentale, visualisation' },
  { value: 'mixte', label: 'Mixte', desc: 'Toutes les catégories mélangées' },
];

const difficulties = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
];

export default function NewTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    category: 'logique',
    difficulty: 'intermediaire',
    questionCount: 10,
    timeLimitMinutes: 15,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/internal/tests/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/tests/${data.session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }} className="space-y-5">
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Nouveau test d&apos;intelligence</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
          Configurez votre test cognitif
        </p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: '10px', padding: '12px 14px' }}>
          <IconAlertCircle style={{ width: '18px', height: '18px', color: '#DC2626', flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '13px', color: '#991B1B', lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>Catégorie</label>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '8px' }}>
              {categories.map((c) => {
                const isSelected = form.category === c.value;
                return (
                  <button key={c.value} type="button" onClick={() => setForm({ ...form, category: c.value })}
                    style={{
                      border: isSelected ? '1.5px solid #534AB7' : '0.5px solid #D1D5DB',
                      borderRadius: '10px', padding: '12px', textAlign: 'left', cursor: 'pointer',
                      background: isSelected ? '#F5F3FF' : '#fff',
                    }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', margin: 0, color: isSelected ? '#534AB7' : '#111827' }}>{c.label}</p>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>{c.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>Difficulté</label>
            <div className="flex flex-wrap" style={{ gap: '8px' }}>
              {difficulties.map((d) => {
                const isSelected = form.difficulty === d.value;
                return (
                  <button key={d.value} type="button" onClick={() => setForm({ ...form, difficulty: d.value })}
                    style={{
                      flex: 1, padding: '8px 16px', fontSize: '13px', fontWeight: 500, borderRadius: '8px', cursor: 'pointer',
                      border: isSelected ? 'none' : '0.5px solid #D1D5DB',
                      background: isSelected ? '#534AB7' : 'transparent', color: isSelected ? '#fff' : 'inherit',
                    }}>
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row" style={{ gap: '12px' }}>
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>
                Nombre de questions ({form.questionCount})
              </label>
              <input type="range" min={5} max={20} step={1} value={form.questionCount}
                onChange={(e) => setForm({ ...form, questionCount: Number(e.target.value) })}
                style={{ width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                <span>5</span>
                <span>20</span>
              </div>
            </div>
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>
                Temps limite ({form.timeLimitMinutes} min)
              </label>
              <input type="range" min={5} max={60} step={5} value={form.timeLimitMinutes}
                onChange={(e) => setForm({ ...form, timeLimitMinutes: Number(e.target.value) })}
                style={{ width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>

          <LoadingButton type="submit" loading={loading} fullWidth style={{ padding: '10px 16px', fontSize: '14px', borderRadius: '8px' }}>
            Commencer le test
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
