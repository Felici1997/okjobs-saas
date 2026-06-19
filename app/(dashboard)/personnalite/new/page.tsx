'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingButton from '@/app/components/LoadingButton';

interface Question {
  id: string;
  trait: string;
  question_text: string;
  order_num: number;
}

const traitLabels: Record<string, string> = {
  ouverture: 'Ouverture',
  conscienciosite: 'Conscienciosité',
  extraversion: 'Extraversion',
  agreabilite: 'Agréabilité',
  stabilite: 'Stabilité émotionnelle',
};

const traitDescriptions: Record<string, string> = {
  ouverture: 'Curiosité intellectuelle, créativité, goût pour la nouveauté',
  conscienciosite: 'Organisation, rigueur, sens des responsabilités',
  extraversion: 'Sociabilité, énergie, aisance relationnelle',
  agreabilite: 'Coopération, confiance, empathie',
  stabilite: 'Résilience, gestion du stress, équilibre émotionnel',
};

const traitOrder = ['ouverture', 'conscienciosite', 'extraversion', 'agreabilite', 'stabilite'];

const ratingLabels = ['Pas du tout d\'accord', 'Plutôt pas d\'accord', 'Neutre', 'Plutôt d\'accord', 'Tout à fait d\'accord'];

export default function NewPersonnalitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentTraitIndex, setCurrentTraitIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    const existingId = searchParams.get('id');
    if (existingId) {
      setSessionId(existingId);
      fetchExistingSession(existingId);
    } else {
      startNewTest();
    }
  }, []);

  const startNewTest = async () => {
    try {
      const res = await fetch('/api/internal/personality/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSessionId(data.session.id);
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingSession = async (id: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'personality_test_questions', filters: { is_active: true }, orders: [{ column: 'order_num', ascending: true }] }),
      });
      const data = await res.json();
      const qs = data.data || [];
      setQuestions(qs.filter((q: any) => q.is_active !== false));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const currentTrait = traitOrder[currentTraitIndex];
  const traitQuestions = questions.filter((q) => q.trait === currentTrait);
  const allAnswered = traitOrder.every((trait) =>
    questions.filter((q) => q.trait === trait).every((q) => answers[q.id] !== undefined)
  );

  const handleSubmit = async () => {
    if (!allAnswered || !sessionId) return;
    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, rating]) => ({
        questionId,
        rating,
      }));

      const res = await fetch(`/api/internal/personality/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/personnalite/${sessionId}/results`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading loading-spinner loading-lg" style={{ color: '#534AB7' }} />
      </div>
    );
  }

  if (!sessionId || questions.length === 0) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px' }}>Erreur</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: '0 0 20px' }}>{error || 'Impossible de charger le test.'}</p>
        <button onClick={() => router.push('/personnalite')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: '#374151', cursor: 'pointer' }}>
          Retour
        </button>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const answeredTotal = Object.keys(answers).length;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="space-y-5">
      <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Test de personnalité</h1>

      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: '10px', padding: '10px 12px' }}>
          <span style={{ fontSize: '13px', color: '#991B1B', lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      {/* Progress */}
      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
          <span>Dimension {currentTraitIndex + 1}/{traitOrder.length}</span>
          <span>{answeredTotal}/{totalQuestions} questions</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#534AB7', borderRadius: '99px', transition: 'width 0.3s', width: `${(answeredTotal / totalQuestions) * 100}%` }} />
        </div>
      </div>

      {/* Trait tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {traitOrder.map((trait, i) => {
          const traitQCount = questions.filter((q) => q.trait === trait).length;
          const traitAnswered = questions.filter((q) => q.trait === trait).filter((q) => answers[q.id] !== undefined).length;
          const isComplete = traitAnswered === traitQCount;
          const isActive = i === currentTraitIndex;
          return (
            <button key={trait} onClick={() => setCurrentTraitIndex(i)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500,
                padding: '6px 10px', borderRadius: '6px',
                border: `1px solid ${isActive ? '#534AB7' : isComplete ? '#639922' : '#D1D5DB'}`,
                background: isActive ? '#F5F3FF' : isComplete ? '#F0F7E6' : '#fff',
                color: isActive ? '#534AB7' : isComplete ? '#639922' : '#6B7280', cursor: 'pointer',
              }}>
              {traitLabels[trait]}
              <span style={{ fontSize: '10px', opacity: 0.8 }}>({traitAnswered}/{traitQCount})</span>
            </button>
          );
        })}
      </div>

      {/* Current trait */}
      <div style={{ marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{traitLabels[currentTrait]}</h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>{traitDescriptions[currentTrait]}</p>
      </div>

      {traitQuestions.map((q) => (
        <div key={q.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 12px', lineHeight: 1.5 }}>{q.question_text}</p>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', width: '80px', textAlign: 'right' }}>Pas d'accord</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map((rating) => {
                const isSelected = answers[q.id] === rating;
                return (
                  <button key={rating} onClick={() => setAnswers({ ...answers, [q.id]: rating })}
                    title={ratingLabels[rating - 1]}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      border: `1.5px solid ${isSelected ? '#534AB7' : '#D1D5DB'}`,
                      background: isSelected ? '#534AB7' : '#fff',
                      color: isSelected ? '#fff' : '#6B7280',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                    {rating}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: '11px', color: '#9CA3AF', width: '80px' }}>D'accord</span>
          </div>
        </div>
      ))}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2rem' }}>
        <button disabled={currentTraitIndex === 0} onClick={() => setCurrentTraitIndex(currentTraitIndex - 1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500,
            padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent',
            color: currentTraitIndex === 0 ? '#D1D5DB' : '#374151', cursor: currentTraitIndex === 0 ? 'not-allowed' : 'pointer',
          }}>
          ← Précédent
        </button>

        {currentTraitIndex < traitOrder.length - 1 ? (
          <button disabled={traitQuestions.some((q) => answers[q.id] === undefined)}
            onClick={() => setCurrentTraitIndex(currentTraitIndex + 1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500,
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: traitQuestions.some((q) => answers[q.id] === undefined) ? '#D1D5DB' : '#534AB7',
              color: '#fff', cursor: traitQuestions.some((q) => answers[q.id] === undefined) ? 'not-allowed' : 'pointer',
            }}>
            Suivant →
          </button>
        ) : (
          <LoadingButton variant="primary" loading={submitting} disabled={!allAnswered} onClick={handleSubmit}>
            Terminer le test
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
