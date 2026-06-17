'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  IconHistory,
  IconTrendingUp,
  IconCode,
  IconUsersGroup,
  IconMessages,
  IconCircleCheckFilled,
  IconFocus2,
} from '@tabler/icons-react';

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
    <div style={{ maxWidth: '960px', margin: '0 auto' }} className="space-y-5">
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Historique</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
          Consultez vos entretiens passés et suivez votre progression
        </p>
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <IconHistory style={{ width: '16px', height: '16px', color: '#534AB7' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Total entretiens</p>
            <p style={{ fontSize: '22px', fontWeight: 500, color: '#111827', margin: '2px 0' }}>{sessions.length}</p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>ce mois-ci</p>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <IconTrendingUp style={{ width: '16px', height: '16px', color: '#854F0B' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Score moyen</p>
            <p style={{ fontSize: '22px', fontWeight: 500, color: avgScoreColor ?? '#9CA3AF', margin: '2px 0' }}>
              {avgScore !== null ? `${avgScore}%` : '—'}
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
              sur {scoredSessions.length} entretien{scoredSessions.length > 1 ? 's' : ''} noté{scoredSessions.length > 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <IconCircleCheckFilled style={{ width: '16px', height: '16px', color: '#085041' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Terminés</p>
            <p style={{ fontSize: '22px', fontWeight: 500, color: '#27500A', margin: '2px 0' }}>{completedCount}</p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
              {inProgressCount} en cours · {abandonedCount} abandonné{abandonedCount > 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <IconFocus2 style={{ width: '16px', height: '16px', color: '#3C3489' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Meilleur score</p>
            <p style={{ fontSize: '22px', fontWeight: 500, color: '#3C3489', margin: '2px 0' }}>
              {bestScore !== null ? `${bestScore}%` : '—'}
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {bestContext || '—'}
            </p>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <IconHistory style={{ width: '26px', height: '26px', color: '#3C3489' }} />
          </div>
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>Aucun entretien pour le moment</p>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Lancez votre premier entretien simulé
          </p>
          <Link href="/interview" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
            Commencer
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block" style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                  <th className="px-4 py-3 text-left text-[11px] font-medium" style={{ color: '#9CA3AF', letterSpacing: '0.05em', width: '130px' }}>Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium" style={{ color: '#9CA3AF', letterSpacing: '0.05em' }}>Poste</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium" style={{ color: '#9CA3AF', letterSpacing: '0.05em', width: '140px' }}>Type</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium" style={{ color: '#9CA3AF', letterSpacing: '0.05em', width: '120px' }}>Difficulté</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium" style={{ color: '#9CA3AF', letterSpacing: '0.05em', width: '130px' }}>Score</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium" style={{ color: '#9CA3AF', letterSpacing: '0.05em', width: '120px' }}>Statut</th>
                  <th className="px-4 py-3 text-right" style={{ width: '70px' }}></th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '0.5px solid #E5E7EB' }}>
                {sessions.map((s) => (
                  <tr key={s.id} className="hover" style={{ transition: 'background 0.1s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <td className="px-4 py-3.5 text-xs" style={{ color: '#9CA3AF' }}>
                      {new Date(s.started_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-medium" style={{ color: '#111827' }}>{s.job_title}</td>
                    <td className="px-4 py-3.5">
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500,
                        padding: '2px 10px', borderRadius: '99px',
                        background: s.interview_type === 'technique' ? '#E6F1FB' : s.interview_type === 'comportemental' ? '#EEEDFE' : '#E1F5EE',
                        color: s.interview_type === 'technique' ? '#0C447C' : s.interview_type === 'comportemental' ? '#3C3489' : '#085041',
                      }}>
                        {s.interview_type === 'technique' ? <IconCode style={{ width: '12px', height: '12px' }} /> :
                         s.interview_type === 'comportemental' ? <IconUsersGroup style={{ width: '12px', height: '12px' }} /> :
                         <IconMessages style={{ width: '12px', height: '12px' }} />}
                        {typeLabels[s.interview_type] || s.interview_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', textTransform: 'capitalize' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.difficulty === 'debutant' || s.difficulty === 'débutant' ? '#639922' : s.difficulty === 'intermediaire' || s.difficulty === 'intermédiaire' ? '#BA7517' : '#E24B4A' }} />
                        {s.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {s.score !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '4px', borderRadius: '99px', background: '#E5E7EB', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '99px', width: `${s.score}%`, backgroundColor: s.score >= 50 ? '#639922' : s.score >= 20 ? '#BA7517' : '#E24B4A' }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 500, minWidth: '32px', textAlign: 'right', color: s.score >= 50 ? '#27500A' : s.score >= 20 ? '#633806' : '#791F1F' }}>
                            {s.score}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#D1D5DB', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500,
                        padding: '2px 10px', borderRadius: '99px',
                        background: s.status === 'completed' ? '#E1F5EE' : s.status === 'in_progress' ? '#FAEEDA' : s.status === 'timeout' ? '#FCEBEB' : '#F3F4F6',
                        color: s.status === 'completed' ? '#085041' : s.status === 'in_progress' ? '#633806' : s.status === 'timeout' ? '#791F1F' : '#6B7280',
                      }}>
                        {s.status === 'completed' && <IconCircleCheckFilled style={{ width: '12px', height: '12px' }} />}
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {s.status === 'completed' || s.status === 'in_progress' ? (
                        <Link
                          href={s.status === 'completed' ? `/interview/${s.id}/feedback` : `/interview/${s.id}`}
                          style={{ fontSize: '12px', border: '0.5px solid #D1D5DB', borderRadius: '6px', padding: '4px 10px', color: '#6B7280', textDecoration: 'none', transition: 'background 0.1s, color 0.1s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#111827'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}
                        >
                          Voir
                        </Link>
                      ) : (
                        <span style={{ fontSize: '12px', border: '0.5px solid #E5E7EB', borderRadius: '6px', padding: '4px 10px', color: '#D1D5DB', cursor: 'not-allowed', display: 'inline-block' }}>
                          Voir
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {sessions.map((s) => (
              <div key={s.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1rem' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: 0 }}>{s.job_title}</p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
                      {new Date(s.started_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {s.status === 'completed' || s.status === 'in_progress' ? (
                    <Link
                      href={s.status === 'completed' ? `/interview/${s.id}/feedback` : `/interview/${s.id}`}
                      style={{ fontSize: '12px', fontWeight: 500, border: '0.5px solid #D1D5DB', borderRadius: '6px', padding: '4px 12px', color: '#6B7280', textDecoration: 'none', whiteSpace: 'nowrap' }}
                    >
                      Voir
                    </Link>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 500, border: '0.5px solid #E5E7EB', borderRadius: '6px', padding: '4px 12px', color: '#D1D5DB', whiteSpace: 'nowrap' }}>
                      Voir
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 500,
                    padding: '2px 8px', borderRadius: '99px',
                    background: s.interview_type === 'technique' ? '#E6F1FB' : s.interview_type === 'comportemental' ? '#EEEDFE' : '#E1F5EE',
                    color: s.interview_type === 'technique' ? '#0C447C' : s.interview_type === 'comportemental' ? '#3C3489' : '#085041',
                  }}>
                    {s.interview_type === 'technique' ? <IconCode style={{ width: '10px', height: '10px' }} /> :
                     s.interview_type === 'comportemental' ? <IconUsersGroup style={{ width: '10px', height: '10px' }} /> :
                     <IconMessages style={{ width: '10px', height: '10px' }} />}
                    {typeLabels[s.interview_type] || s.interview_type}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6B7280' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.difficulty === 'debutant' || s.difficulty === 'débutant' ? '#639922' : s.difficulty === 'intermediaire' || s.difficulty === 'intermédiaire' ? '#BA7517' : '#E24B4A' }} />
                    <span style={{ textTransform: 'capitalize' }}>{s.difficulty}</span>
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 500,
                    padding: '2px 8px', borderRadius: '99px',
                    background: s.status === 'completed' ? '#E1F5EE' : s.status === 'in_progress' ? '#FAEEDA' : s.status === 'timeout' ? '#FCEBEB' : '#F3F4F6',
                    color: s.status === 'completed' ? '#085041' : s.status === 'in_progress' ? '#633806' : s.status === 'timeout' ? '#791F1F' : '#6B7280',
                  }}>
                    {s.status === 'completed' && <IconCircleCheckFilled style={{ width: '10px', height: '10px' }} />}
                    {statusLabels[s.status] || s.status}
                  </span>
                </div>
                {s.score !== null ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', borderRadius: '99px', background: '#E5E7EB', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '99px', width: `${s.score}%`, backgroundColor: s.score >= 50 ? '#639922' : s.score >= 20 ? '#BA7517' : '#E24B4A' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '36px', textAlign: 'right', color: s.score >= 50 ? '#27500A' : s.score >= 20 ? '#633806' : '#791F1F' }}>
                      {s.score}%
                    </span>
                  </div>
                ) : (
                  <span style={{ color: '#D1D5DB', fontSize: '12px' }}>Pas encore noté</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
