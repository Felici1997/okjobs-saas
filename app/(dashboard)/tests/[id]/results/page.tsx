'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import LoadingButton from '@/app/components/LoadingButton';
import { IconArrowLeft, IconTrophyFilled, IconAlertTriangle, IconChartHistogram, IconBrain, IconCircleCheck, IconFocus2 } from '@tabler/icons-react';

const categoryLabels: Record<string, string> = {
  logique: 'Raisonnement logique',
  math: 'Calcul mathématique',
  verbal: 'Compréhension verbale',
  spatial: 'Raisonnement spatial',
  mixte: 'Mixte',
};

type Evaluation = {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  categoryBreakdown: Record<string, number>;
};

export default function TestResultsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const rawId = params.id;
  const id = typeof rawId === 'string' ? rawId : '';

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState<{
    category: string;
    difficulty: string;
    score: number | null;
    max_score: number | null;
    question_count: number;
    time_limit_minutes: number;
    status: string;
    started_at: string;
  } | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from('cognitive_test_sessions')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) {
          router.push('/tests');
          return;
        }
        setSession(data);
        setLoading(false);
      });
  }, [user, id, supabase, router]);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/internal/tests/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEvaluation(data.evaluation);
      setSession((prev) => prev ? { ...prev, score: data.session.score, max_score: data.session.maxScore } : prev);
    } catch {
      // fallback: use raw score
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

  if (!session) return null;

  const rawScore = session.max_score ? Math.round(((session.score ?? 0) / session.max_score) * 100) : 0;
  const displayScore = evaluation?.score ?? rawScore;
  const circumference = 2 * Math.PI * 55;
  const offset = circumference - (displayScore / 100) * circumference;
  const scoreRingColor = displayScore >= 70 ? '#639922' : displayScore >= 40 ? '#BA7517' : '#E24B4A';

  const scoreLabel =
    displayScore >= 90 ? 'Excellent !'
    : displayScore >= 75 ? 'Très bon niveau'
    : displayScore >= 60 ? 'Bon niveau'
    : displayScore >= 40 ? 'Niveau moyen'
    : 'À améliorer';

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/tests" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 14px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: 'inherit', textDecoration: 'none' }}>
          <IconArrowLeft style={{ width: '14px', height: '14px' }} />
          Retour
        </Link>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Résultats du test</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
            {categoryLabels[session.category] || session.category}
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 1rem' }}>
          <svg viewBox="0 0 130 130" width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="65" cy="65" r="55" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle cx="65" cy="65" r="55" fill="none" strokeWidth="8" strokeLinecap="round"
              stroke={scoreRingColor} strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '28px', fontWeight: 500, lineHeight: 1, color: scoreRingColor }}>{displayScore}</span>
            <span style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>/ 100</span>
          </div>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{scoreLabel}</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px', fontSize: '13px', color: '#6B7280' }}>
          <span>{session.score ?? '-'} / {session.max_score ?? '-'} bonnes réponses</span>
          <span>·</span>
          <span>{session.question_count} questions</span>
          <span>·</span>
          <span style={{ textTransform: 'capitalize' }}>{session.difficulty}</span>
        </div>

        {!evaluation && (
          <div style={{ marginTop: '1.25rem' }}>
            <LoadingButton onClick={generateReport} loading={generating} icon={<IconBrain style={{ width: '16px', height: '16px' }} />}
              style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px' }}>
              Générer le rapport IA
            </LoadingButton>
          </div>
        )}
      </div>

      {evaluation?.summary && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 8px' }}>
            <IconChartHistogram style={{ width: '16px', height: '16px', color: '#534AB7' }} />
            Résumé
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
            {evaluation.summary}
          </p>
        </div>
      )}

      {evaluation && evaluation.strengths && evaluation.strengths.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #639922' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#27500A', margin: '0 0 8px' }}>
            <IconTrophyFilled style={{ width: '16px', height: '16px' }} />
            Points forts
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {evaluation.strengths.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                <IconCircleCheck style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px', color: '#639922' }} />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation && evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #BA7517' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#633806', margin: '0 0 8px' }}>
            <IconAlertTriangle style={{ width: '16px', height: '16px' }} />
            Points à améliorer
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {evaluation.weaknesses.map((w, i) => (
              <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                <IconFocus2 style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px', color: '#BA7517' }} />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation && evaluation.categoryBreakdown && Object.keys(evaluation.categoryBreakdown).length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 12px' }}>
            <IconChartHistogram style={{ width: '16px', height: '16px', color: '#534AB7' }} />
            Détail par catégorie
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(evaluation.categoryBreakdown).map(([cat, score]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{categoryLabels[cat] || cat}</span>
                  <span style={{ color: '#6B7280' }}>{score}/100</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '99px', background: score >= 70 ? '#639922' : score >= 40 ? '#BA7517' : '#E24B4A', width: `${score}%`, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', paddingBottom: '2rem' }}>
        <Link href="/tests/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
          Nouveau test
        </Link>
        <Link href="/tests" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: 'inherit', textDecoration: 'none' }}>
          Voir tous les tests
        </Link>
      </div>
    </div>
  );
}
