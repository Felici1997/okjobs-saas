'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Trophy,
  Target,
  Lightbulb,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Code,
  Users,
  MessageSquare,
  Lock,
} from 'lucide-react';

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const score = feedback?.score ?? session.score ?? 0;
  const circumference = 2 * Math.PI * 55;
  const offset = circumference - (score / 100) * circumference;

  const scoreRingColor =
    score >= 70 ? '#639922' : score >= 40 ? '#BA7517' : '#E24B4A';
  const scoreTextColor =
    score >= 70 ? '#639922' : score >= 40 ? '#BA7517' : '#E24B4A';

  const scoreLabel =
    score >= 90
      ? 'Excellent !'
      : score >= 80
        ? 'Bon travail'
        : score >= 60
          ? 'Peut mieux faire'
          : score >= 40
            ? 'En dessous des attentes'
            : 'Insuffisant';

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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/history" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4" />
          Retour
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Feedback</h1>
          <p className="text-base-content/60 mt-1">{session.job_title}</p>
        </div>
      </div>

      {/* Score ring */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body items-center text-center py-8">
          <div className="relative w-[130px] h-[130px] mx-auto mb-5">
            <svg viewBox="0 0 130 130" width="130" height="130" className="-rotate-90">
              <circle
                cx="65" cy="65" r="55"
                fill="none"
                stroke="oklch(var(--b3))"
                strokeWidth="8"
              />
              <circle
                cx="65" cy="65" r="55"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                stroke={scoreRingColor}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-[28px] font-medium leading-none"
                style={{ color: scoreTextColor }}
              >
                {score}
              </span>
              <span className="text-[13px] text-base-content/50 mt-0.5">/ 100</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold">{scoreLabel}</h2>
          <div className="flex items-center gap-2 mt-2 text-sm text-base-content/60">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {session.interview_type === 'technique' ? <Code className="w-3 h-3" /> :
               session.interview_type === 'comportemental' ? <Users className="w-3 h-3" /> :
               <MessageSquare className="w-3 h-3" />}
              {typeLabels[session.interview_type] || session.interview_type}
            </span>
            <span>·</span>
            <span>{session.status === 'timeout' ? 'Temps écoulé' : 'Terminé'}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      {feedback?.summary && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-base">
              <BarChart3 className="w-4" />
              Résumé
            </h2>
            <p className="text-sm text-base-content/70 leading-relaxed mt-1">
              {feedback.summary}
            </p>
          </div>
        </div>
      )}

      {/* Upgrade banner for free users */}
      {plan === 'free' && hasProContent && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg bg-blue-200 flex items-center justify-center flex-shrink-0">
            <Crown className="w-[18px] text-blue-800" />
          </div>
          <div className="text-sm text-blue-700 leading-relaxed">
            <strong className="text-blue-800">Feedback basique inclus.</strong>{' '}
            Passez à Pro pour voir l'analyse détaillée — forces, faiblesses et recommandations personnalisées.
            <br />
            <Link href="/#pricing" className="font-medium text-blue-800 underline">
              Voir les offres Pro →
            </Link>
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses — blurred for free */}
      {plan === 'free' ||
      (feedback?.strengths && feedback.strengths.length > 0) ||
      (feedback?.weaknesses && feedback.weaknesses.length > 0) ? (
        <div className="relative">
          <div className={plan === 'free' ? 'blur-sm pointer-events-none select-none opacity-50' : ''}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(plan === 'free' || (feedback?.strengths && feedback.strengths.length > 0)) && (
                <div className="card bg-base-100 shadow-sm border-t-4 border-t-[#639922]">
                  <div className="card-body">
                    <h2 className="card-title text-base" style={{ color: '#27500A' }}>
                      <Trophy className="w-4" />
                      Points forts
                    </h2>
                    <ul className="space-y-2 mt-1">
                      {plan === 'free' && (!feedback?.strengths || feedback.strengths.length === 0)
                        ? placeholderStrengths.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm text-base-content/70">
                              <CheckCircle2 className="w-4 flex-shrink-0 mt-0.5" style={{ color: '#639922' }} />
                              {s}
                            </li>
                          ))
                        : feedback?.strengths?.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm text-base-content/70">
                              <CheckCircle2 className="w-4 flex-shrink-0 mt-0.5" style={{ color: '#639922' }} />
                              {s}
                            </li>
                          ))}
                    </ul>
                  </div>
                </div>
              )}
              {(plan === 'free' || (feedback?.weaknesses && feedback.weaknesses.length > 0)) && (
                <div className="card bg-base-100 shadow-sm border-t-4 border-t-[#BA7517]">
                  <div className="card-body">
                    <h2 className="card-title text-base" style={{ color: '#633806' }}>
                      <AlertTriangle className="w-4" />
                      Points à améliorer
                    </h2>
                    <ul className="space-y-2 mt-1">
                      {plan === 'free' && (!feedback?.weaknesses || feedback.weaknesses.length === 0)
                        ? placeholderWeaknesses.map((w, i) => (
                            <li key={i} className="flex gap-2 text-sm text-base-content/70">
                              <Target className="w-4 flex-shrink-0 mt-0.5" style={{ color: '#BA7517' }} />
                              {w}
                            </li>
                          ))
                        : feedback?.weaknesses?.map((w, i) => (
                            <li key={i} className="flex gap-2 text-sm text-base-content/70">
                              <Target className="w-4 flex-shrink-0 mt-0.5" style={{ color: '#BA7517' }} />
                              {w}
                            </li>
                          ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
          {plan === 'free' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                <Lock className="w-3 h-3" />
                Réservé aux membres Pro
              </span>
            </div>
          )}
        </div>
      ) : null}

      {/* Recommendations — blurred for free */}
      {plan === 'free' || (feedback?.recommendations && feedback.recommendations.length > 0) ? (
        <div className="relative">
          <div className={plan === 'free' ? 'blur-sm pointer-events-none select-none opacity-50' : ''}>
            <div className="card bg-base-100 shadow-sm border-t-4 border-t-[#534AB7]">
              <div className="card-body">
                <h2 className="card-title text-base" style={{ color: '#3C3489' }}>
                  <Lightbulb className="w-4" />
                  Recommandations
                </h2>
                <ul className="space-y-2 mt-1">
                  {plan === 'free' && (!feedback?.recommendations || feedback.recommendations.length === 0)
                    ? placeholderRecommendations.map((r, i) => (
                        <li key={i} className="flex gap-2 text-sm text-base-content/70">
                          <TrendingUp className="w-4 flex-shrink-0 mt-0.5" style={{ color: '#534AB7' }} />
                          {r}
                        </li>
                      ))
                    : feedback?.recommendations?.map((r, i) => (
                        <li key={i} className="flex gap-2 text-sm text-base-content/70">
                          <TrendingUp className="w-4 flex-shrink-0 mt-0.5" style={{ color: '#534AB7' }} />
                          {r}
                        </li>
                      ))}
                </ul>
              </div>
            </div>
          </div>
          {plan === 'free' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                <Lock className="w-3 h-3" />
                Réservé aux membres Pro
              </span>
            </div>
          )}
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex justify-center gap-4 pb-8">
        <Link href="/interview" className="btn btn-primary">
          Nouvel entretien
        </Link>
        <Link href="/history" className="btn btn-outline">
          Voir l'historique
        </Link>
      </div>
    </div>
  );
}
