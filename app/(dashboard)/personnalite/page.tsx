'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Spinner from '@/app/components/Spinner';
import OnboardingModal from '@/app/components/OnboardingModal';
import { useOnboarding } from '@/app/hooks/useOnboarding';

type Session = {
  id: string;
  status: string;
  started_at: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  in_progress: 'En cours',
  completed: 'Terminé',
};

const personalitySlides = [
  {
    title: 'Test de personnalité Big Five',
    description: 'Découvrez vos 5 grands traits de personnalité : Ouverture, Conscience, Extraversion, Agréabilité, Névrosisme.',
    illustration: '/illustrations/onboarding/personnalite/slide-1.svg',
  },
  {
    title: '30 affirmations',
    description: 'Répondez à 30 affirmations sur une échelle de 1 à 5. Il n\'y a pas de bonnes ou mauvaises réponses, soyez sincère.',
    illustration: '/illustrations/onboarding/personnalite/slide-2.svg',
  },
  {
    title: 'Profil détaillé',
    description: 'Obtenez un radar de personnalité complet avec des explications et des pistes de carrière adaptées à votre profil.',
    illustration: '/illustrations/onboarding/personnalite/slide-3.svg',
  },
  {
    title: 'Recommandations',
    description: 'Recevez des recommandations de formation et des conseils personnalisés basés sur votre profil de personnalité.',
    illustration: '/illustrations/onboarding/personnalite/slide-4.svg',
  },
];

export default function PersonnalitePage() {
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { showModal, dismiss } = useOnboarding('personality_test');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('personality_test_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSessions(data as Session[]);
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
      <OnboardingModal isOpen={showModal} slides={personalitySlides} onDismiss={dismiss} onStart={() => { dismiss(); router.push('/personnalite/new'); }} />
      <div style={{ maxWidth: '720px', margin: '0 auto' }} className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Test de personnalité</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
            Découvrez votre profil Big Five (OCEAN)
          </p>
        </div>
        <Link href="/personnalite/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
          Nouveau test
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 6px' }}>Aucun test de personnalité</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: '0 0 16px' }}>
            Découvrez vos traits de personnalité et les environnements de travail qui vous correspondent.
          </p>
          <Link href="/personnalite/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
            Commencer le test
          </Link>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const isCompleted = s.status === 'completed';
                return (
                  <tr key={s.id} style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                    <td style={{ padding: '12px 14px', fontSize: '14px', color: '#6B7280' }}>
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-flex', fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '99px',
                        background: isCompleted ? '#F0F7E6' : '#FFF8E6',
                        color: isCompleted ? '#639922' : '#BA7517',
                      }}>
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {s.status === 'in_progress' && (
                        <Link href={`/personnalite/new?id=${s.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
                          Continuer
                        </Link>
                      )}
                      {isCompleted && (
                        <Link href={`/personnalite/${s.id}/results`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', border: '0.5px solid #D1D5DB', background: 'transparent', color: '#374151', textDecoration: 'none' }}>
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
