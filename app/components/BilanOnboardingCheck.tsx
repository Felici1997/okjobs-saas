'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import OnboardingModal from '@/app/components/OnboardingModal';

const slides = [
  {
    title: 'Bilan de compétences',
    description: 'Évaluez vos compétences transversales à travers 5 catégories : Communication, Leadership, Résolution de problèmes, Travail d\'équipe et Adaptabilité.',
    illustration: '/illustrations/onboarding/bilan/slide-1.svg',
  },
  {
    title: '25 questions ciblées',
    description: '5 questions par catégorie avec une échelle de 1 à 5. Répondez en toute sincérité pour un bilan précis.',
    illustration: '/illustrations/onboarding/bilan/slide-2.svg',
  },
  {
    title: 'Rapport personnalisé',
    description: 'Obtenez un score par catégorie, une analyse détaillée et des recommandations de formation sur mesure.',
    illustration: '/illustrations/onboarding/bilan/slide-3.svg',
  },
  {
    title: 'Progression visible',
    description: 'Repassez le bilan quand vous voulez pour suivre l\'évolution de vos compétences au fil du temps.',
    illustration: '/illustrations/onboarding/bilan/slide-4.svg',
  },
];

export default function BilanOnboardingCheck() {
  const router = useRouter();
  const { showModal, dismiss } = useOnboarding('skills_assessment');

  return <OnboardingModal isOpen={showModal} slides={slides} onDismiss={dismiss} onStart={() => { dismiss(); router.push('/bilan/new'); }} />;
}
