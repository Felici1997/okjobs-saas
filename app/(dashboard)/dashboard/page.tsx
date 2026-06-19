'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import ScoreChart from '@/app/components/ScoreChart';
import Spinner from '@/app/components/Spinner';
import {
  IconFileDescription,
  IconMessageFilled,
  IconTrendingUp,
  IconLayoutDashboardFilled,
  IconChevronRight,
  IconHistory,
  IconCrownFilled,
} from '@tabler/icons-react';

type Stats = {
  cvCount: number;
  interviewCount: number;
  completedThisMonth: number;
  averageScore: number | null;
  mostPracticedType: string | null;
  mostPracticedTypeCount: number;
  totalScored: number;
};

type SessionScore = { label: string; score: number | null };

type RawSession = {
  score: number | null;
  started_at: string;
  interview_type: string;
};

const typeLabels: Record<string, string> = {
  technique: 'Technique',
  comportemental: 'Comportemental',
  motivationnel: 'Motivationnel',
};

const pillColors: Record<string, { bg: string; text: string }> = {
  technique: { bg: '#E6F1FB', text: '#0C447C' },
  comportemental: { bg: '#EEEDFE', text: '#3C3489' },
  motivationnel: { bg: '#E1F5EE', text: '#085041' },
};

const now = new Date();
const firstOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

function getAvgColor(avg: number | null): { bar: string; text: string } {
  if (avg === null) return { bar: '#D1D5DB', text: '#9CA3AF' };
  if (avg >= 50) return { bar: '#639922', text: '#27500A' };
  if (avg >= 20) return { bar: '#BA7517', text: '#633806' };
  return { bar: '#791F1F', text: '#791F1F' };
}

function getReadyMessage(avg: number | null): string {
  if (avg === null) return "Commencez un entretien pour évaluer votre niveau.";
  if (avg >= 70) return "Excellent niveau ! Vous êtes prêt pour un vrai entretien.";
  if (avg >= 50) return "Bonne progression, continuez à vous entraîner pour perfectionner vos réponses.";
  if (avg >= 20) return "Encore un effort, la pratique régulière est la clé de la réussite.";
  return "Entraînez-vous davantage pour gagner en confiance et en compétence.";
}

export default function DashboardPage() {
  const { user, plan } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState<Stats>({
    cvCount: 0,
    interviewCount: 0,
    completedThisMonth: 0,
    averageScore: null,
    mostPracticedType: null,
    mostPracticedTypeCount: 0,
    totalScored: 0,
  });
  const [sessions, setSessions] = useState<RawSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;

      const [cvResult, interviewResult] = await Promise.all([
        supabase
          .from('cv_documents')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('interview_sessions')
          .select('score, started_at, interview_type', { count: 'exact' })
          .neq('status', 'in_progress'),
      ]);

      const data = (interviewResult.data ?? []) as RawSession[];
      const scores = data
        .map((r) => r.score)
        .filter((s): s is number => s !== null);

      const typeCount: Record<string, number> = {};
      for (const r of data) {
        if (r.interview_type) {
          typeCount[r.interview_type] = (typeCount[r.interview_type] || 0) + 1;
        }
      }
      const typeEntries = Object.entries(typeCount);
      const mostType = typeEntries.length > 0
        ? typeEntries.reduce((a, b) => (a[1] >= b[1] ? a : b))
        : null;

      const monthCompleted = data.filter((r) => {
        const d = new Date(r.started_at);
        return d >= firstOfMonth;
      }).length;

      setStats({
        cvCount: cvResult.count ?? 0,
        interviewCount: interviewResult.count ?? 0,
        completedThisMonth: monthCompleted,
        averageScore:
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null,
        mostPracticedType: mostType ? typeLabels[mostType[0]] || mostType[0] : null,
        mostPracticedTypeCount: mostType ? mostType[1] : 0,
        totalScored: scores.length,
      });

      setSessions(data);
      setLoading(false);
    }
    loadStats();
  }, [user, supabase]);

  const chartData = useMemo(() => {
    const sorted = [...sessions]
      .filter((s) => s.score !== null)
      .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
      .slice(-20);
    return sorted.map((r) => ({
      label: new Date(r.started_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      }),
      score: r.score,
    }));
  }, [sessions]);

  const avgColor = getAvgColor(stats.averageScore);
  const readyMessage = getReadyMessage(stats.averageScore);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-base-content/60 mt-1">
            Bonjour, <strong style={{ color: '#534AB7' }}>{user?.user_metadata?.full_name || user?.email}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/cv" style={{ fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: 'inherit', textDecoration: 'none' }}>
            Mon CV
          </Link>
          <Link href="/interview" style={{ fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
            Nouvel entretien
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconLayoutDashboardFilled style={{ width: '16px', height: '16px', color: '#534AB7' }} />
            </div>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Total entretiens</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500, color: '#111827' }}>
            {loading ? <Spinner size="sm" /> : stats.interviewCount}
          </div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
            {stats.completedThisMonth} terminé{stats.completedThisMonth !== 1 ? 's' : ''} ce mois-ci
          </div>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconTrendingUp style={{ width: '16px', height: '16px', color: '#854F0B' }} />
            </div>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Score moyen</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500, color: avgColor.text }}>
            {loading ? <Spinner size="sm" color="#6B7280" /> : (stats.averageScore !== null ? `${stats.averageScore}%` : '—')}
          </div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
            sur {stats.totalScored} entretien{stats.totalScored !== 1 ? 's' : ''} notés
          </div>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconMessageFilled style={{ width: '16px', height: '16px', color: '#0C447C' }} />
            </div>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Type le plus pratiqué</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 500, color: '#111827' }}>
            {loading ? <Spinner size="sm" color="#6B7280" /> : (stats.mostPracticedType || '—')}
          </div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
            {stats.mostPracticedTypeCount > 0 ? `${stats.mostPracticedTypeCount} sur ${stats.interviewCount} entretien${stats.interviewCount !== 1 ? 's' : ''}` : ''}
          </div>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '10px' }}>Prêt pour le vrai entretien ?</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: '#6B7280' }}>
            <span>Progression</span>
            <span style={{ fontWeight: 500, color: avgColor.text }}>{stats.averageScore !== null ? `${stats.averageScore}%` : '—'}</span>
          </div>
          <div style={{ height: '6px', borderRadius: '99px', background: '#E5E7EB', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ height: '100%', borderRadius: '99px', background: avgColor.bar, width: `${stats.averageScore ?? 0}%` }} />
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.5', marginBottom: '12px' }}>
            {readyMessage}
          </div>
          <Link href="/interview" style={{ display: 'block', textAlign: 'center', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
            S'entraîner
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Tendance des scores</h2>
                <select className="select select-ghost select-sm">
                  <option>10 dernières sessions</option>
                </select>
              </div>
              {plan === 'free' ? (
                <div className="relative">
                  <div className="blur-sm pointer-events-none opacity-40 select-none">
                    {chartData.length > 0 ? <ScoreChart data={chartData} /> : <div className="h-64 flex items-center justify-center text-base-content/40">Aucune donnée disponible</div>}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                        <IconCrownFilled style={{ width: '20px', height: '20px', color: '#534AB7' }} />
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>Débloquez votre progression</p>
                      <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>Visualisez l'évolution de vos scores avec Pro</p>
                      <Link href="/#pricing" style={{ fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
                        Voir les offres
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                chartData.length > 0 ? <ScoreChart data={chartData} /> : <div className="h-64 flex items-center justify-center text-base-content/40">Aucune donnée disponible</div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Sessions récentes</h2>
              <RecentInterviews supabase={supabase} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="text-lg font-bold mb-4">Actions rapides</h2>
              <div className="space-y-3">
                <Link
                  href="/cv"
                  className="flex items-center justify-between p-4 rounded-xl bg-base-200 hover:bg-base-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconFileDescription style={{ width: '16px', height: '16px', color: '#534AB7' }} />
                    </div>
                    <span className="font-medium">Mon CV</span>
                  </div>
                  <IconChevronRight className="w-4 text-base-content/40 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/interview"
                  className="flex items-center justify-between p-4 rounded-xl bg-base-200 hover:bg-base-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<IconMessageFilled style={{ width: '16px', height: '16px', color: '#0C447C' }} />
                    </div>
                    <span className="font-medium">Nouvel entretien</span>
                  </div>
                  <IconChevronRight className="w-4 text-base-content/40 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/history"
                  className="flex items-center justify-between p-4 rounded-xl bg-base-200 hover:bg-base-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconHistory style={{ width: '16px', height: '16px', color: '#085041' }} />
                    </div>
                    <span className="font-medium">Voir l'historique</span>
                  </div>
                  <IconChevronRight className="w-4 text-base-content/40 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentInterviews({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [sessions, setSessions] = useState<{ id: string; job_title: string; interview_type: string; score: number | null; status: string; started_at: string }[]>([]);

  useEffect(() => {
    supabase
      .from('interview_sessions')
      .select('id, job_title, interview_type, score, status, started_at')
      .order('started_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setSessions(data);
      });
  }, [supabase]);

  if (sessions.length === 0) return null;

  const typeLabels: Record<string, string> = {
    technique: 'Technique',
    comportemental: 'Comportemental',
    motivationnel: 'Motivationnel',
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr className="text-base-content/60">
            <th>Date</th>
            <th>Mode</th>
            <th>Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="hover:bg-base-200/50 transition-colors">
              <td className="text-sm">
                {new Date(s.started_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                })}
              </td>
              <td>
                <span className="badge badge-ghost font-medium text-xs">
                  {typeLabels[s.interview_type] || s.interview_type}
                </span>
              </td>
              <td className="font-bold">
                {s.score !== null ? (
                  <span className={s.score >= 70 ? 'text-success' : s.score >= 40 ? 'text-warning' : 'text-error'}>
                    {s.score}%
                  </span>
                ) : (
                  <span className="text-base-content/40">—</span>
                )}
              </td>
              <td>
                <Link
                  href={s.status === 'completed' ? `/interview/${s.id}/feedback` : `/interview/${s.id}`}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Voir rapport
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
