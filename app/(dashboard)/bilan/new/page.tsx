'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingButton from '@/app/components/LoadingButton';

interface Question {
  id: string;
  text: string;
  orderNum: number;
}

interface Category {
  category: string;
  questions: Question[];
}

export default function NewBilanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    const existingId = searchParams.get('id');
    if (existingId) {
      setAssessmentId(existingId);
      fetchExistingAssessment(existingId);
    } else {
      startNewAssessment();
    }
  }, []);

  const startNewAssessment = async () => {
    try {
      const res = await fetch('/api/internal/bilan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAssessmentId(data.assessment.id);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAssessment = async (id: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'skills_assessment_questions',
          filters: {},
          orders: [{ column: 'order_num', ascending: true }],
        }),
      });
      const data = await res.json();
      if (data.data) {
        const catRes = await fetch('/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'skills_assessment_categories', filters: {} }),
        });
        const catData = await catRes.json();
        const categoriesMap = (catData.data || []).reduce((acc: any, c: any) => {
          acc[c.id] = { name: c.name };
          return acc;
        }, {});
        const grouped: Record<string, Category> = {};
        (data.data || []).forEach((q: any) => {
          const catInfo = categoriesMap[q.category_id] || { name: 'Autre' };
          if (!grouped[q.category_id]) {
            grouped[q.category_id] = { category: catInfo.name, questions: [] };
          }
          grouped[q.category_id].questions.push({ id: q.id, text: q.question_text, orderNum: q.order_num });
        });
        setCategories(Object.values(grouped));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = categories[currentCatIndex];
  const allAnswered = categories.every((cat) =>
    cat.questions.every((q) => answers[q.id] !== undefined)
  );

  const handleSubmit = async () => {
    if (!allAnswered || !assessmentId) return;
    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, rating]) => ({
        questionId,
        rating,
      }));

      const res = await fetch('/api/internal/bilan/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, answers: answersArray }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/bilan/${assessmentId}/results`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredInCategory = (cat: Category) =>
    cat.questions.filter((q) => answers[q.id] !== undefined).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading loading-spinner loading-lg" style={{ color: '#534AB7' }} />
      </div>
    );
  }

  if (!assessmentId || categories.length === 0) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px' }}>Erreur</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: '0 0 20px' }}>
          {error || 'Impossible de charger le bilan.'}
        </p>
        <button onClick={() => router.push('/bilan')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: '#374151', cursor: 'pointer' }}>
          Retour
        </button>
      </div>
    );
  }

  const totalQuestions = categories.reduce((s, c) => s + c.questions.length, 0);
  const answeredTotal = Object.keys(answers).length;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="space-y-5">
      <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Bilan de compétences</h1>

      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: '10px', padding: '10px 12px' }}>
          <span style={{ fontSize: '13px', color: '#991B1B', lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
          <span>Catégorie {currentCatIndex + 1}/{categories.length}</span>
          <span>{answeredTotal}/{totalQuestions} questions</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#534AB7', borderRadius: '99px', transition: 'width 0.3s', width: `${(answeredTotal / totalQuestions) * 100}%` }} />
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {categories.map((cat, i) => {
          const isComplete = answeredInCategory(cat) === cat.questions.length;
          const isActive = i === currentCatIndex;
          const borderColor = isActive ? '#534AB7' : isComplete ? '#639922' : '#D1D5DB';
          const bgColor = isActive ? '#F5F3FF' : isComplete ? '#F0F7E6' : '#fff';
          return (
            <button
              key={cat.category}
              onClick={() => setCurrentCatIndex(i)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500,
                padding: '6px 10px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor,
                color: isActive ? '#534AB7' : isComplete ? '#639922' : '#6B7280', cursor: 'pointer',
              }}
            >
              {cat.category}
              <span style={{ fontSize: '10px', opacity: 0.8 }}>
                ({answeredInCategory(cat)}/{cat.questions.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Questions for current category */}
      {currentCategory && (
        <div className="space-y-4">
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{currentCategory.category}</h2>

          {currentCategory.questions.map((q) => (
            <div key={q.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 12px', lineHeight: 1.5 }}>{q.text}</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map((rating) => {
                  const isSelected = answers[q.id] === rating;
                  return (
                    <button
                      key={rating}
                      onClick={() => setAnswers({ ...answers, [q.id]: rating })}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%', border: `1.5px solid ${isSelected ? '#534AB7' : '#D1D5DB'}`,
                        background: isSelected ? '#534AB7' : '#fff', color: isSelected ? '#fff' : '#6B7280',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                      title={`Note ${rating}/5`}
                    >
                      {rating}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2rem' }}>
            <button
              disabled={currentCatIndex === 0}
              onClick={() => setCurrentCatIndex(currentCatIndex - 1)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500,
                padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent',
                color: currentCatIndex === 0 ? '#D1D5DB' : '#374151', cursor: currentCatIndex === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Précédent
            </button>

            {currentCatIndex < categories.length - 1 ? (
              <button
                disabled={answeredInCategory(currentCategory) < currentCategory.questions.length}
                onClick={() => setCurrentCatIndex(currentCatIndex + 1)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500,
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: answeredInCategory(currentCategory) < currentCategory.questions.length ? '#D1D5DB' : '#534AB7',
                  color: '#fff', cursor: answeredInCategory(currentCategory) < currentCategory.questions.length ? 'not-allowed' : 'pointer',
                }}
              >
                Suivant →
              </button>
            ) : (
              <LoadingButton
                variant="primary"
                loading={submitting}
                disabled={!allAnswered}
                onClick={handleSubmit}
              >
                Terminer le bilan
              </LoadingButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
