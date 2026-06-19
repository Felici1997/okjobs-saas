'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import TrainingRecommendationCard from '@/app/components/TrainingRecommendationCard';
import {
  IconLoader2,
  IconArrowLeft,
  IconTrophyFilled,
  IconFocus2,
  IconBulb,
  IconTrendingUp,
  IconChartHistogram,
  IconCircleCheck,
  IconAlertTriangle,
  IconCrownFilled,
  IconCode,
  IconUsersGroup,
  IconMessage2,
  IconLock,
} from '@tabler/icons-react';

type Feedback = {
  id: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  score: number;
};

const typeLabels: Record<string, string> = {
  technique: 'Technique',
  comportemental: 'Comportemental',
  motivationnel: 'Motivationnel',
};

export default function FeedbackPage() {
  const { user, plan } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{
    job_title: string;
    sector: string;
    interview_type: string;
    status: string;
    score: number | null;
  } | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!user || !id) return;

    Promise.all([
      supabase.from('interview_sessions').select('*').eq('id', id).single(),
      supabase
        .from(plan === 'free' ? 'v_feedback_public' : 'interview_feedback')
        .select('*')
        .eq('session_id', id)
        .single(),
    ]).then(([sessionRes, feedbackRes]) => {
      if (sessionRes.error || !sessionRes.data) {
        router.push('/history');
        return;
      }
      setSession(sessionRes.data);
      if (feedbackRes.data) setFeedback(feedbackRes.data);
      setLoading(false);
    });
  }, [user, id, supabase, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 className="w-8 h-8 animate-spin" style={{ color: '#534AB7' }} />
      </div>
    );
  }

  if (!session) return null;

  const score = feedback?.score ?? session.score ?? 0;
  const circumference = 2 * Math.PI * 55;
  const offset = circumference - (score / 100) * circumference;

  const scoreRingColor = score >= 70 ? '#639922' : score >= 40 ? '#BA7517' : '#E24B4A';
  const scoreTextColor = score >= 70 ? '#639922' : score >= 40 ? '#BA7517' : '#E24B4A';

  const scoreLabel =
    score >= 90 ? 'Excellent !'
    : score >= 80 ? 'Bon travail'
    : score >= 60 ? 'Peut mieux faire'
    : score >= 40 ? 'En dessous des attentes'
    : 'Insuffisant';

  const typeColors: Record<string, { bg: string; text: string }> = {
    technique: { bg: '#E6F1FB', text: '#0C447C' },
    comportemental: { bg: '#EEEDFE', text: '#3C3489' },
    motivationnel: { bg: '#E1F5EE', text: '#085041' },
  };
  const tc = typeColors[session.interview_type] || { bg: '#F3F4F6', text: '#6B7280' };

  const placeholderStrengths = [
    'Bonne maîtrise des concepts clés',
    'Communication claire et structurée',
    'Capacité d\'analyse et de synthèse',
  ];
  const placeholderWeaknesses = [
    'Manque de précision technique',
    'Exemples concrets insuffisants',
    'Structure des réponses à améliorer',
  ];
  const placeholderRecommendations = [
    'Approfondir les connaissances du secteur visé',
    'Pratiquer des cas concrets de mise en situation',
    'Travailler la précision et le détail dans les réponses',
  ];

  const hasProContent =
    plan === 'free' ||
    (feedback?.strengths && feedback.strengths.length > 0) ||
    (feedback?.weaknesses && feedback.weaknesses.length > 0) ||
    (feedback?.recommendations && feedback.recommendations.length > 0);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }} className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/history" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 14px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: 'inherit', textDecoration: 'none' }}>
          <IconArrowLeft style={{ width: '14px', height: '14px' }} />
          Retour
        </Link>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Feedback</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>{session.job_title}</p>
        </div>
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 1.25rem' }}>
          <svg viewBox="0 0 130 130" width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="65" cy="65" r="55" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle cx="65" cy="65" r="55" fill="none" strokeWidth="8" strokeLinecap="round"
              stroke={scoreRingColor} strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '28px', fontWeight: 500, lineHeight: 1, color: scoreTextColor }}>{score}</span>
            <span style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>/ 100</span>
          </div>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{scoreLabel}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '13px', color: '#6B7280' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '99px', background: tc.bg, color: tc.text }}>
            {session.interview_type === 'technique' ? <IconCode style={{ width: '12px', height: '12px' }} /> :
             session.interview_type === 'comportemental' ? <IconUsersGroup style={{ width: '12px', height: '12px' }} /> :
             <IconMessage2 style={{ width: '12px', height: '12px' }} />}
            {typeLabels[session.interview_type] || session.interview_type}
          </span>
          <span>·</span>
          <span>{session.status === 'timeout' ? 'Temps écoulé' : 'Terminé'}</span>
        </div>
      </div>

      {feedback?.summary && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 8px' }}>
            <IconChartHistogram style={{ width: '16px', height: '16px', color: '#534AB7' }} />
            Résumé
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
            {feedback.summary}
          </p>
        </div>
      )}

      {plan === 'free' && hasProContent && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#EEEDFE', border: '0.5px solid #D0C8F4', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#534AB7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconCrownFilled style={{ width: '16px', height: '16px', color: '#fff' }} />
          </div>
          <div style={{ fontSize: '13px', color: '#3C3489', lineHeight: 1.5 }}>
            <strong>Feedback basique inclus.</strong>{' '}
            Passez à Pro pour voir l&apos;analyse détaillée — forces, faiblesses et recommandations personnalisées.
            <br />
            <Link href="/#pricing" style={{ fontWeight: 500, color: '#3C3489', textDecoration: 'underline' }}>
              Voir les offres Pro →
            </Link>
          </div>
        </div>
      )}

      {(plan === 'free' ||
        (feedback?.strengths && feedback.strengths.length > 0) ||
        (feedback?.weaknesses && feedback.weaknesses.length > 0)) ? (
        <div style={{ position: 'relative' }}>
          <div style={plan === 'free' ? { filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 } : {}}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {(plan === 'free' || (feedback?.strengths && feedback.strengths.length > 0)) && (
                <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #639922' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#27500A', margin: '0 0 8px' }}>
                    <IconTrophyFilled style={{ width: '16px', height: '16px' }} />
                    Points forts
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {(plan === 'free' && (!feedback?.strengths || feedback.strengths.length === 0)
                      ? placeholderStrengths : feedback?.strengths ?? []).map((s, i) => (
                      <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                        <IconCircleCheck style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px', color: '#639922' }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(plan === 'free' || (feedback?.weaknesses && feedback.weaknesses.length > 0)) && (
                <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #BA7517' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#633806', margin: '0 0 8px' }}>
                    <IconAlertTriangle style={{ width: '16px', height: '16px' }} />
                    Points à améliorer
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {(plan === 'free' && (!feedback?.weaknesses || feedback.weaknesses.length === 0)
                      ? placeholderWeaknesses : feedback?.weaknesses ?? []).map((w, i) => (
                      <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                        <IconFocus2 style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px', color: '#BA7517' }} />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          {plan === 'free' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '99px', background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #D0C8F4' }}>
                <IconLock style={{ width: '12px', height: '12px' }} />
                Réservé aux membres Pro
              </span>
            </div>
          )}
        </div>
      ) : null}

      {(plan === 'free' || (feedback?.recommendations && feedback.recommendations.length > 0)) ? (
        <div style={{ position: 'relative' }}>
          <div style={plan === 'free' ? { filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 } : {}}>
            <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #534AB7' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#3C3489', margin: '0 0 8px' }}>
                <IconBulb style={{ width: '16px', height: '16px' }} />
                Recommandations
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(plan === 'free' && (!feedback?.recommendations || feedback.recommendations.length === 0)
                  ? placeholderRecommendations : feedback?.recommendations ?? []).map((r, i) => (
                  <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                    <IconTrendingUp style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px', color: '#534AB7' }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {plan === 'free' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '99px', background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #D0C8F4' }}>
                <IconLock style={{ width: '12px', height: '12px' }} />
                Réservé aux membres Pro
              </span>
            </div>
          )}
        </div>
      ) : null}

      {session.sector && session.job_title && (
        <TrainingRecommendationCard
          sessionId={id}
          jobTitle={session.job_title}
          sector={session.sector}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', paddingBottom: '2rem' }}>
        <Link href="/interview" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
          Nouvel entretien
        </Link>
        <Link href="/history" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: 'inherit', textDecoration: 'none' }}>
          Voir l&apos;historique
        </Link>
      </div>
    </div>
  );
}
