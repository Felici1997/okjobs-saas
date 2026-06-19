'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';

export default function TestPassagePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const rawId = params.id;
  const id = typeof rawId === 'string' ? rawId : '';
  const fetchingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{
    category: string;
    difficulty: string;
    question_count: number;
    time_limit_minutes: number;
    current_question: number;
    status: string;
    started_at: string;
  } | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    correctIndex: number;
    explanation: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!user || !id || fetchingRef.current) return;
    fetchingRef.current = true;

    supabase
      .from('cognitive_test_sessions')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data: sessionData, error: sessionError }) => {
        if (sessionError || !sessionData) {
          router.push('/tests');
          return;
        }

        if (sessionData.status !== 'in_progress') {
          setFinished(true);
          setSession(sessionData);
          setLoading(false);
          return;
        }

        setSession(sessionData);
        setTimeLeft(sessionData.time_limit_minutes * 60);
        setCurrentIndex(sessionData.current_question);

        supabase
          .from('cognitive_test_questions')
          .select('*')
          .eq('session_id', id)
          .order('order_num', { ascending: true })
          .then(({ data: qData }) => {
            if (qData) setQuestions(qData);
            setLoading(false);
          });
      });
  }, [user, id, supabase, router]);

  useEffect(() => {
    if (!session || session.status !== 'in_progress' || finished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session, finished, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !finished && session?.status === 'in_progress' && !loading) {
      handleTimeout();
    }
  }, [timeLeft]);

  const handleTimeout = async () => {
    setFinished(true);
    try {
      await fetch(`/api/internal/tests/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id }),
      });
      await supabase
        .from('cognitive_test_sessions')
        .update({ status: 'timeout' })
        .eq('id', id);
    } catch {}
  };

  const handleAnswer = async (index: number) => {
    if (selectedAnswer !== null || showResult) return;
    setSelectedAnswer(index);
    setError('');

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    try {
      const res = await fetch(`/api/internal/tests/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: currentQ.id, answerIndex: index }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLastResult(data.answer);
      setShowResult(true);

      if (data.completed) {
        setTimeout(() => {
          setFinished(true);
        }, 1500);
        return;
      }

      setTimeout(() => {
        if (data.nextQuestion) {
          setQuestions((prev) => [...prev, data.nextQuestion]);
          setCurrentIndex((n) => n + 1);
        }
        setSelectedAnswer(null);
        setShowResult(false);
        setLastResult(null);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
      setSelectedAnswer(null);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 className="w-8 h-8 animate-spin" style={{ color: '#534AB7' }} />
      </div>
    );
  }

  if (finished) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2 2" />
            <path d="M12 5V3" />
            <path d="M10 19l-2 3" />
            <path d="M14 19l2 3" />
          </svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 6px' }}>Test terminé</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: '0 0 20px' }}>
          {session?.status === 'timeout' || timeLeft === 0
            ? 'Le temps imparti est écoulé.'
            : 'Vous avez complété toutes les questions.'}
        </p>
        <button onClick={() => router.push(`/tests/${id}/results`)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', cursor: 'pointer' }}>
          Voir les résultats
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="space-y-4">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            Question {currentIndex + 1} / {session?.question_count}
          </span>
          <div style={{ width: '120px', height: '6px', background: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#534AB7', borderRadius: '99px', transition: 'width 0.3s', width: `${((currentIndex + 1) / (session?.question_count || 1)) * 100}%` }} />
          </div>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: timeLeft < 60 ? '#DC2626' : '#111827' }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: '10px', padding: '10px 12px' }}>
          <IconAlertCircle style={{ width: '16px', height: '16px', color: '#DC2626', flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '13px', color: '#991B1B', lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      {currentQuestion && (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.25rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, lineHeight: 1.5, margin: '0 0 1.25rem' }}>
            {currentQuestion.text}
          </h2>

          <div className="flex flex-col" style={{ gap: '10px' }}>
            {(currentQuestion.options || []).map((opt: string, i: number) => {
              let borderColor = '#D1D5DB';
              let bg = '#fff';
              if (showResult) {
                if (i === lastResult?.correctIndex) {
                  borderColor = '#639922';
                  bg = '#F0F7E6';
                } else if (i === selectedAnswer && !lastResult?.isCorrect) {
                  borderColor = '#DC2626';
                  bg = '#FEF2F2';
                } else {
                  borderColor = '#E5E7EB';
                  bg = '#F9FAFB';
                }
              } else if (selectedAnswer === i) {
                borderColor = '#534AB7';
                bg = '#F5F3FF';
              }

              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={showResult || selectedAnswer !== null}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px',
                    fontSize: '14px', lineHeight: 1.4, textAlign: 'left', cursor: showResult ? 'default' : 'pointer',
                    borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: bg,
                    transition: 'all 0.15s',
                  }}>
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0,
                    border: `1.5px solid ${borderColor}`,
                    color: showResult
                      ? (i === lastResult?.correctIndex ? '#639922' : i === selectedAnswer && !lastResult?.isCorrect ? '#DC2626' : '#9CA3AF')
                      : selectedAnswer === i ? '#534AB7' : '#6B7280',
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {showResult && i === lastResult?.correctIndex && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {showResult && i === selectedAnswer && !lastResult?.isCorrect && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {showResult && lastResult && (
            <div style={{
              marginTop: '1rem', padding: '12px 14px', borderRadius: '10px',
              background: lastResult.isCorrect ? '#F0F7E6' : '#FEF2F2',
              border: `0.5px solid ${lastResult.isCorrect ? '#D5E8B5' : '#FECACA'}`,
            }}>
              <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px', color: lastResult.isCorrect ? '#639922' : '#DC2626' }}>
                {lastResult.isCorrect ? 'Correct !' : 'Incorrect'}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                {lastResult.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
