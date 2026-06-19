'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/app/components/Spinner';

const traitLabels: Record<string, string> = {
  ouverture: 'Ouverture',
  conscienciosite: 'Conscienciosité',
  extraversion: 'Extraversion',
  agreabilite: 'Agréabilité',
  stabilite: 'Stabilité',
};

const traitOrder = ['ouverture', 'conscienciosite', 'extraversion', 'agreabilite', 'stabilite'];

export default function PersonnaliteResultsPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const id = typeof rawId === 'string' ? rawId : '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'personality_test_results', filters: { eq: { session_id: id } } }),
      });
      const data = await res.json();
      const r = data.data?.[0];
      if (!r) throw new Error('Résultats introuvables');
      setResult(r);
      setScores(r.trait_scores || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#639922';
    if (score >= 40) return '#BA7517';
    return '#DC2626';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Élevé';
    if (score >= 40) return 'Modéré';
    return 'Faible';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" color="#534AB7" />
      </div>
    );
  }

  if (error && !result) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px' }}>Erreur</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: '0 0 20px' }}>{error}</p>
        <button onClick={() => router.push('/personnalite')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: '#374151', cursor: 'pointer' }}>
          Retour
        </button>
      </div>
    );
  }

  const allScores = traitOrder.map((t) => scores[t] ?? 50);
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  };

  const cx = 150, cy = 150, r = 120;
  const points = traitOrder.map((_, i) => {
    const angle = (360 / traitOrder.length) * i;
    return polarToCartesian(cx, cy, r, angle);
  });
  const gridLines = [25, 50, 75, 100].map((pct) => {
    const gr = (pct / 100) * r;
    return traitOrder.map((_, i) => {
      const angle = (360 / traitOrder.length) * i;
      return polarToCartesian(cx, cy, gr, angle);
    });
  });
  const dataPoints = allScores.map((score, i) => {
    const angle = (360 / traitOrder.length) * i;
    const sr = (score / 100) * r;
    return polarToCartesian(cx, cy, sr, angle);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const labelPoints = traitOrder.map((_, i) => {
    const angle = (360 / traitOrder.length) * i;
    return polarToCartesian(cx, cy, r + 20, angle);
  });

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/personnalite" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 14px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: 'inherit', textDecoration: 'none' }}>
          ← Retour
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Votre profil de personnalité</h1>
      </div>

      {/* Profile type */}
      {result?.profile_type && (
        <div style={{ background: '#F5F3FF', border: '0.5px solid #D5D0FA', borderRadius: '12px', padding: '1.1rem 1.25rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#534AB7', margin: 0 }}>{result.profile_type}</h2>
        </div>
      )}

      {/* Radar chart */}
      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
        <svg viewBox="0 0 340 340" width="300" height="300" style={{ margin: '0 auto' }}>
          {gridLines.map((line, li) => (
            <polygon key={li} points={line.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#E5E7EB" strokeWidth="1" />
          ))}
          {traitOrder.map((_, i) => {
            const next = (i + 1) % traitOrder.length;
            return <line key={i} x1={points[i].x} y1={points[i].y} x2={points[next].x} y2={points[next].y} stroke="#E5E7EB" strokeWidth="1" />;
          })}
          {points.map((p, i) => (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="1" />
          ))}
          <polygon points={dataPolygon} fill="rgba(83, 74, 183, 0.15)" stroke="#534AB7" strokeWidth="2" />
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#534AB7" />
          ))}
          {labelPoints.map((p, i) => {
            const isLeft = p.x < cx;
            const isTop = p.y < cy;
            return (
              <text key={i} x={p.x} y={p.y} textAnchor={isLeft ? 'end' : 'start'} dominantBaseline={isTop ? 'auto' : 'hanging'}
                fontSize="11" fill="#6B7280" fontWeight={500}>
                {traitLabels[traitOrder[i]]}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Score bars */}
      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {traitOrder.map((trait) => {
            const score = scores[trait] ?? 50;
            const color = getScoreColor(score);
            return (
              <div key={trait}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500, color: '#374151' }}>{traitLabels[trait]}</span>
                  <span style={{ color: '#6B7280' }}>{score}/100 <span style={{ color, fontWeight: 500 }}>({getScoreLabel(score)})</span></span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '99px', background: color, width: `${score}%`, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work environments */}
      {result?.work_environments && result.work_environments.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 10px' }}>Environnements de travail adaptés</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {result.work_environments.map((env: string, i: number) => (
              <span key={i} style={{ fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '99px', background: '#EEEDFE', color: '#534AB7' }}>{env}</span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {result?.strengths && result.strengths.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #639922' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#27500A', margin: '0 0 8px' }}>Forces</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {result.strengths.map((s: string, i: number) => (
              <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                <span style={{ color: '#639922', flexShrink: 0 }}>✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Development axes */}
      {result?.development_axes && result.development_axes.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #BA7517' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#633806', margin: '0 0 8px' }}>Axes de développement</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {result.development_axes.map((a: string, i: number) => (
              <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                <span style={{ color: '#BA7517', flexShrink: 0 }}>→</span>{a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended roles */}
      {result?.recommended_roles && result.recommended_roles.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 8px' }}>Métiers et rôles recommandés</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {result.recommended_roles.map((role: string, i: number) => (
              <span key={i} style={{ fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '6px', background: '#E6F1FB', color: '#0C447C' }}>{role}</span>
            ))}
          </div>
        </div>
      )}

      {/* Team fit */}
      {result?.team_fit && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 8px' }}>Fonctionnement en équipe</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{result.team_fit}</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2rem' }}>
        <Link href="/personnalite/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
          Nouveau test
        </Link>
      </div>
    </div>
  );
}
