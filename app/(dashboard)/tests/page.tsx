'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Spinner from '@/app/components/Spinner';
import OnboardingModal from '@/app/components/OnboardingModal';
import { useOnboarding } from '@/app/hooks/useOnboarding';

type TestSession = {
  id: string;
  category: string;
  difficulty: string;
  status: string;
  score: number | null;
  max_score: number | null;
  question_count: number;
  time_limit_minutes: number;
  created_at: string;
};

const categoryLabels: Record<string, string> = {
  logique: 'Raisonnement logique',
  math: 'Calcul mathématique',
  verbal: 'Compréhension verbale',
  spatial: 'Raisonnement spatial',
  mixte: 'Mixte',
};

const statusLabels: Record<string, string> = {
  in_progress: 'En cours',
  completed: 'Terminé',
  timeout: 'Temps écoulé',
  abandoned: 'Abandonné',
};

const testSlides = [
  {
    title: 'Tests d\'intelligence cognitive',
    description: 'Évaluez votre raisonnement logique, mathématique, verbal et spatial avec des QCM générés par IA.',
    illustration: '/illustrations/onboarding/tests/slide-1.svg',
  },
  {
    title: 'Questions adaptatives',
    description: 'Chaque question est générée en fonction de votre niveau. Plus vous répondez juste, plus les questions deviennent difficiles.',
    illustration: '/illustrations/onboarding/tests/slide-2.svg',
  },
  {
    title: 'Temps limité',
    description: 'Chaque test est chronométré. Répondez rapidement mais avec précision — vous ne pouvez pas revenir en arrière.',
    illustration: '/illustrations/onboarding/tests/slide-3.svg',
  },
  {
    title: 'Analyse détaillée',
    description: 'Obtenez un score, une évaluation par l\'IA et des recommandations de formation personnalisées.',
    illustration: '/illustrations/onboarding/tests/slide-4.svg',
  },
];

export default function TestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { showModal, dismiss } = useOnboarding('cognitive_test');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('cognitive_test_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSessions(data as TestSession[]);
        setLoading(false);
      });
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" color="#534AB7" />
      </div>
    );
  }

  return (
    <>
      <OnboardingModal isOpen={showModal} slides={testSlides} onDismiss={dismiss} onStart={() => { dismiss(); router.push('/tests/new'); }} />
      <div style={{ maxWidth: '720px', margin: '0 auto' }} className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Tests d&apos;intelligence</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
            Évaluez vos capacités cognitives
          </p>
        </div>
        <Link href="/tests/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
          Nouveau test
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 6px' }}>Aucun test pour le moment</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: '0 0 16px' }}>
            Commencez un test d&apos;intelligence pour évaluer vos capacités cognitives.
          </p>
          <Link href="/tests/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
            Commencer un test
          </Link>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégorie</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const statusColor =
                  s.status === 'completed' ? '#639922' :
                  s.status === 'in_progress' ? '#BA7517' :
                  '#DC2626';
                const statusBg =
                  s.status === 'completed' ? '#F0F7E6' :
                  s.status === 'in_progress' ? '#FFF8E6' :
                  '#FEF2F2';

                return (
                  <tr key={s.id} style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                    <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 500 }}>{categoryLabels[s.category] || s.category}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-flex', fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '99px', background: statusBg, color: statusColor }}>
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '14px', color: '#6B7280' }}>
                      {s.status === 'completed' ? `${s.score ?? '-'} / ${s.max_score ?? '-'}` : '-'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '14px', color: '#6B7280' }}>
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {s.status === 'in_progress' && (
                        <Link href={`/tests/${s.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
                          Continuer
                        </Link>
                      )}
                      {(s.status === 'completed' || s.status === 'timeout') && (
                        <Link href={`/tests/${s.id}/results`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', border: '0.5px solid #D1D5DB', background: 'transparent', color: '#374151', textDecoration: 'none' }}>
                          Voir résultats
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}
