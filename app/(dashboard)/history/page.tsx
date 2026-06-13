'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  History,
  TrendingUp,
  Code,
  Users,
  MessageSquare,
  CheckCircle2,
  Target,
} from 'lucide-react';

type Session = {
  id: string;
  job_title: string;
  interview_type: string;
  difficulty: string;
  score: number | null;
  status: string;
  started_at: string;
};

const typeLabels: Record<string, string> = {
  technique: 'Technique',
  comportemental: 'Comportemental',
  motivationnel: 'Motivationnel',
};

const statusLabels: Record<string, string> = {
  completed: 'Terminé',
  in_progress: 'En cours',
  timeout: 'Temps écoulé',
  abandoned: 'Abandonné',
};

export default function HistoryPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('interview_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSessions(data);
      });
  }, [user, supabase]);

  const scoredSessions = sessions.filter((s) => s.score !== null);
  const avgScore =
    scoredSessions.length > 0
      ? Math.round(
          scoredSessions.reduce((a, s) => a + (s.score ?? 0), 0) /
            scoredSessions.length
        )
      : null;

  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const inProgressCount = sessions.filter((s) => s.status === 'in_progress').length;
  const abandonedCount = sessions.filter(
    (s) => s.status === 'abandoned' || s.status === 'timeout'
  ).length;

  const bestScore =
    scoredSessions.length > 0
      ? Math.max(...scoredSessions.map((s) => s.score!))
      : null;
  const bestSession =
    bestScore !== null
      ? sessions.find((s) => s.score === bestScore) ?? null
      : null;
  const bestContext =
    bestSession
      ? `${bestSession.job_title} · ${typeLabels[bestSession.interview_type] || bestSession.interview_type}`
      : null;

  const avgScoreColor =
    avgScore !== null
      ? avgScore >= 50
        ? '#639922'
        : avgScore >= 20
          ? '#BA7517'
          : '#E24B4A'
      : undefined;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historique</h1>
        <p className="text-base-content/60 mt-1">
          Consultez vos entretiens passés et suivez votre progression
        </p>
      </div>

      {/* Stats cards */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-base-100 border border-base-200 rounded-xl p-4">
            <History className="w-5 text-base-content/40 float-right" />
            <p className="text-xs text-base-content/60">Total entretiens</p>
            <p className="text-2xl font-medium mt-0.5">{sessions.length}</p>
            <p className="text-[11px] text-base-content/40 mt-1">ce mois-ci</p>
          </div>
          <div className="bg-base-100 border border-base-200 rounded-xl p-4">
            <TrendingUp className="w-5 text-base-content/40 float-right" />
            <p className="text-xs text-base-content/60">Score moyen</p>
            <p className="text-2xl font-medium mt-0.5" style={{ color: avgScoreColor ?? undefined }}>
              {avgScore !== null ? `${avgScore}%` : '—'}
            </p>
            <p className="text-[11px] text-base-content/40 mt-1">
              sur {scoredSessions.length} entretien{scoredSessions.length > 1 ? 's' : ''} noté{scoredSessions.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-base-100 border border-base-200 rounded-xl p-4">
            <CheckCircle2 className="w-5 text-base-content/40 float-right" />
            <p className="text-xs text-base-content/60">Terminés</p>
            <p className="text-2xl font-medium mt-0.5 text-[#27500A]">{completedCount}</p>
            <p className="text-[11px] text-base-content/40 mt-1">
              {inProgressCount} en cours · {abandonedCount} abandonné{abandonedCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-base-100 border border-base-200 rounded-xl p-4">
            <Target className="w-5 text-base-content/40 float-right" />
            <p className="text-xs text-base-content/60">Meilleur score</p>
            <p className="text-2xl font-medium mt-0.5" style={{ color: '#3C3489' }}>
              {bestScore !== null ? `${bestScore}%` : '—'}
            </p>
            <p className="text-[11px] text-base-content/40 mt-1 truncate">
              {bestContext || '—'}
            </p>
          </div>
        </div>
      )}

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body items-center text-center py-16">
            <History className="w-16 text-base-content/20 mb-4" />
            <h3 className="text-lg font-medium">Aucun entretien pour le moment</h3>
            <p className="text-base-content/60 mt-1 mb-6">
              Lancez votre premier entretien simulé
            </p>
            <Link href="/interview" className="btn btn-primary">
              Commencer
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-200">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-base-content/50 uppercase tracking-wider w-[130px]">Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-base-content/50 uppercase tracking-wider">Poste</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-base-content/50 uppercase tracking-wider w-[140px]">Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-base-content/50 uppercase tracking-wider w-[120px]">Difficulté</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-base-content/50 uppercase tracking-wider w-[130px]">Score</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-base-content/50 uppercase tracking-wider w-[120px]">Statut</th>
                <th className="px-4 py-3 text-right w-[70px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-base-200/50 transition-colors">
                  <td className="px-4 py-3.5 text-xs text-base-content/50">
                    {new Date(s.started_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3.5 font-medium">{s.job_title}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      s.interview_type === 'technique'
                        ? 'bg-blue-100 text-blue-800'
                        : s.interview_type === 'comportemental'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {s.interview_type === 'technique' ? <Code className="w-3 h-3" /> :
                       s.interview_type === 'comportemental' ? <Users className="w-3 h-3" /> :
                       <MessageSquare className="w-3 h-3" />}
                      {typeLabels[s.interview_type] || s.interview_type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm capitalize">
                      <span className={`w-[7px] h-[7px] rounded-full ${
                        s.difficulty === 'debutant' || s.difficulty === 'débutant'
                          ? 'bg-green-600'
                          : s.difficulty === 'intermediaire' || s.difficulty === 'intermédiaire'
                            ? 'bg-amber-600'
                            : 'bg-red-500'
                      }`} />
                      {s.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {s.score !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-[4px] rounded-full bg-base-300 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${s.score}%`,
                              backgroundColor:
                                s.score >= 50 ? '#639922' : s.score >= 20 ? '#BA7517' : '#E24B4A',
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-medium min-w-[32px] text-right"
                          style={{
                            color:
                              s.score >= 50 ? '#27500A' : s.score >= 20 ? '#633806' : '#791F1F',
                          }}
                        >
                          {s.score}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-base-content/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      s.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : s.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : s.status === 'timeout'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {statusLabels[s.status] || s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {s.status === 'completed' || s.status === 'in_progress' ? (
                      <Link
                        href={
                          s.status === 'completed'
                            ? `/interview/${s.id}/feedback`
                            : `/interview/${s.id}`
                        }
                        className="text-xs border border-base-300 rounded-md px-2.5 py-1 text-base-content/60 hover:bg-base-200 hover:text-base-content transition-colors inline-block"
                      >
                        Voir
                      </Link>
                    ) : (
                      <span className="text-xs border border-base-200 rounded-md px-2.5 py-1 text-base-content/20 cursor-not-allowed inline-block">
                        Voir
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
