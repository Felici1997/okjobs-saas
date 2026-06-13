'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import ScoreChart from '@/app/components/ScoreChart';
import {
  FileText,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Plus,
  LayoutDashboard,
  ChevronRight,
  CheckCircle2,
  Crown,
} from 'lucide-react';

type Stats = {
  cvCount: number;
  interviewCount: number;
  averageScore: number | null;
};

type SessionScore = { label: string; score: number | null };

export default function DashboardPage() {
  const { user, plan } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState<Stats>({
    cvCount: 0,
    interviewCount: 0,
    averageScore: null,
  });
  const [chartData, setChartData] = useState<SessionScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;

      const [cvResult, interviewResult, scoresResult] = await Promise.all([
        supabase
          .from('cv_documents')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('interview_sessions')
          .select('score', { count: 'exact' })
          .neq('status', 'in_progress'),
        supabase
          .from('interview_sessions')
          .select('score, started_at')
          .neq('status', 'in_progress')
          .order('started_at', { ascending: true })
          .limit(20),
      ]);

      const scores = interviewResult.data
        ?.map((r) => r.score)
        .filter((s): s is number => s !== null) ?? [];

      setStats({
        cvCount: cvResult.count ?? 0,
        interviewCount: interviewResult.count ?? 0,
        averageScore:
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null,
      });

      setChartData(
        (scoresResult.data ?? []).map((r) => ({
          label: new Date(r.started_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
          }),
          score: r.score,
        }))
      );
      setLoading(false);
    }
    loadStats();
  }, [user, supabase]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tableau de Bord Performance
          </h1>
          <p className="text-base-content/60 mt-1">
            Bonjour, <span className="text-primary font-medium">{user?.user_metadata?.full_name || user?.email}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/cv" className="btn btn-ghost btn-sm">Mon CV</Link>
          <Link href="/interview" className="btn btn-primary btn-sm">Nouvel entretien</Link>
        </div>
      </div>

      {/* Top Row: Stats + Ready Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Interviews */}
        <div className="card bg-base-100 shadow-sm border-l-4 border-brand-blue overflow-hidden">
          <div className="card-body p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-base-content/60">Total Entretiens</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {loading ? <span className="loading loading-dots loading-sm" /> : stats.interviewCount}
              </span>
              <span className="text-xs text-success font-medium">↑ 5 cette semaine</span>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="card bg-brand-blue text-white shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-white/80">Score Moyen</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {loading ? <span className="loading loading-dots loading-sm" /> : (stats.averageScore ? `${stats.averageScore}%` : '—')}
              </span>
              <span className="text-xs text-white/80">Derniers 5 : 88%</span>
            </div>
          </div>
        </div>

        {/* Days Active */}
        <div className="card bg-brand-blue text-white shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-white/80">Jours Actifs</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">45</span>
              <span className="text-xs text-white/80">Série : 10 jours</span>
            </div>
          </div>
        </div>

        {/* Ready Card */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-5">
            <h3 className="font-bold text-base">Prêt pour le vrai entretien ?</h3>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-success font-semibold">Prêt à 80%</span>
              </div>
              <progress className="progress progress-success w-full" value="80" max="100"></progress>
            </div>
            <p className="text-xs text-base-content/60 mt-3">
              Votre progression est encourageante, vos compétences s'améliorent. Continuez !
            </p>
            <Link href="/interview" className="btn btn-warning btn-block mt-4 text-brand-blue font-bold">
              S'entraîner
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Chart + Recent Sessions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Trend */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Tendance des Scores</h2>
                <select className="select select-ghost select-sm">
                  <option>Tendance des 10 dernières sessions</option>
                </select>
              </div>
              {plan === 'free' ? (
                <div className="relative">
                  <div className="blur-sm pointer-events-none opacity-40 select-none">
                    {chartData.length > 0 ? <ScoreChart data={chartData} /> : <div className="h-64 flex items-center justify-center text-base-content/40">Aucune donnée disponible</div>}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="p-3 bg-primary/10 rounded-full mx-auto mb-3 w-fit">
                        <Crown className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-semibold mb-1">Débloquez votre progression</p>
                      <p className="text-xs text-base-content/60 mb-4">Visualisez l'évolution de vos scores avec Pro</p>
                      <Link href="/#pricing" className="btn btn-primary btn-sm">Voir les offres</Link>
                    </div>
                  </div>
                </div>
              ) : (
                chartData.length > 0 ? <ScoreChart data={chartData} /> : <div className="h-64 flex items-center justify-center text-base-content/40">Aucune donnée disponible</div>
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Sessions Récentes</h2>
              <RecentInterviews supabase={supabase} />
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="text-lg font-bold mb-4">Actions Rapides</h2>
              <div className="space-y-3">
                <Link
                  href="/cv"
                  className="flex items-center justify-between p-4 rounded-xl bg-base-200 hover:bg-base-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Mon CV</span>
                  </div>
                  <ChevronRight className="w-4 text-base-content/40 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/interview"
                  className="flex items-center justify-between p-4 rounded-xl bg-base-200 hover:bg-base-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Nouvel entretien</span>
                  </div>
                  <ChevronRight className="w-4 text-base-content/40 group-hover:translate-x-1 transition-transform" />
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
