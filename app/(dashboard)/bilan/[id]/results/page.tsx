'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Report {
  globalSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  trainingRecommendations: { programId: string; reason: string }[];
}

const categoryLabels: Record<string, string> = {
  technique: 'Compétences techniques',
  bureautique: 'Bureautique',
  langues: 'Langues',
  management: 'Management',
  soft_skills: 'Soft skills',
};

export default function BilanResultsPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const id = typeof rawId === 'string' ? rawId : '';

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'skills_assessments', filters: { eq: { id } } }),
      });
      const data = await res.json();
      const assessment = data.data?.[0];
      if (!assessment) throw new Error('Bilan introuvable');

      const res2 = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'skills_assessment_results', filters: { eq: { assessment_id: id } } }),
      });
      const data2 = await res2.json();
      const result = data2.data?.[0];

      if (result?.category_scores) {
        setScores(result.category_scores as Record<string, number>);
      }

      if (result?.global_summary || result?.generated_at) {
        setReport({
          globalSummary: result.global_summary || '',
          strengths: result.strengths || [],
          areasForImprovement: result.areas_for_improvement || [],
          trainingRecommendations: result.training_gap_analysis || [],
        });
      } else {
        generateReport();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/internal/bilan/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data.report);
      await loadResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du rapport');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading loading-spinner loading-lg" style={{ color: '#534AB7' }} />
      </div>
    );
  }

  if (error && !report) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px' }}>Erreur</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: '0 0 20px' }}>{error}</p>
        <button onClick={() => router.push('/bilan')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: '#374151', cursor: 'pointer' }}>
          Retour
        </button>
      </div>
    );
  }

  const scoreSlugs = Object.keys(categoryLabels).filter((slug) => scores[slug] != null);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/bilan" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 14px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: 'inherit', textDecoration: 'none' }}>
          ← Retour
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Résultats du bilan</h1>
      </div>

      {generating && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <div className="loading loading-spinner loading-lg" style={{ color: '#534AB7', marginBottom: '1rem' }} />
          <p style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 6px' }}>Génération du rapport personnalisé</p>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>L&apos;IA analyse vos réponses pour produire des recommandations.</p>
        </div>
      )}

      {!generating && (
        <>
          {scoreSlugs.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
              {scoreSlugs.map((slug) => {
                const score = scores[slug];
                const color = score >= 70 ? '#639922' : score >= 40 ? '#BA7517' : '#DC2626';
                const circumference = 2 * Math.PI * 40;
                const offset = circumference - (score / 100) * circumference;
                return (
                  <div key={slug} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 8px' }}>
                      <svg viewBox="0 0 96 96" width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                        <circle cx="48" cy="48" r="40" fill="none" strokeWidth="6" strokeLinecap="round"
                          stroke={color} strokeDasharray={circumference} strokeDashoffset={offset}
                          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '20px', fontWeight: 600, color }}>{score}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>{categoryLabels[slug]}</span>
                  </div>
                );
              })}
            </div>
          )}

          {report && (
            <>
              <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 8px' }}>Synthèse globale</h2>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{report.globalSummary}</p>
              </div>

              <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #639922' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#27500A', margin: '0 0 8px' }}>Points forts</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {report.strengths.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                      <span style={{ color: '#639922', flexShrink: 0 }}>✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #BA7517' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#633806', margin: '0 0 8px' }}>Axes d&apos;amélioration</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {report.areasForImprovement.map((a, i) => (
                    <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                      <span style={{ color: '#BA7517', flexShrink: 0 }}>→</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {report.trainingRecommendations?.length > 0 && (
                <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #085041' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#085041', margin: '0 0 12px' }}>
                    Formations recommandées
                  </h2>
                  <div className="flex flex-col" style={{ gap: '10px' }}>
                    {report.trainingRecommendations.map((rec, i) => (
                      <div key={rec.programId} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#F9FAFB', borderRadius: '8px', border: '0.5px solid #E5E7EB' }}>
                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#085041', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>{rec.programId}</p>
                          <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{rec.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', paddingBottom: '2rem' }}>
        <button onClick={() => router.push('/bilan')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: '#374151', cursor: 'pointer' }}>
          Voir tous les bilans
        </button>
      </div>
    </div>
  );
}
