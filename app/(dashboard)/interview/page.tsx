'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { interviewConfigSchema } from '@/lib/validations/interview';
import { IconLock, IconCrownFilled, IconAlertCircle } from '@tabler/icons-react';
import Spinner from '@/app/components/Spinner';
import type { InterviewType, Difficulty } from '@/types';

const interviewTypes: { value: InterviewType; label: string; desc: string }[] = [
  { value: 'technique', label: 'Technique', desc: 'Compétences techniques, cas pratiques' },
  { value: 'comportemental', label: 'Comportemental', desc: 'Soft skills, méthode STAR' },
  { value: 'motivationnel', label: 'Motivationnel', desc: 'Motivation, projet professionnel' },
];

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
];

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export default function InterviewPage() {
  const { user, plan } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [cvs, setCvs] = useState<{ id: string; title: string }[]>([]);
  const [error, setError] = useState('');

  const [starting, setStarting] = useState(false);

  const [config, setConfig] = useState({
    cvId: '',
    jobTitle: '',
    sector: '',
    interviewType: 'technique' as InterviewType,
    difficulty: 'intermediaire' as Difficulty,
    nbQuestions: 5,
    timerMinutes: 0,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
const clearFieldError = (field: string) => setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  const [quotaBlocked, setQuotaBlocked] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('cv_documents')
      .select('id, title')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setCvs(data);
          if (data.length > 0) setConfig((c) => ({ ...c, cvId: data[0].id }));
        }
      });
  }, [user, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);
    setError('');
    setFieldErrors({});

    const result = interviewConfigSchema.safeParse(config);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.errors) {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    if (plan === 'free') {
      try {
        const { count } = await supabase
          .from('interview_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .eq('status', 'completed')
          .gte('started_at', startOfMonth());

        if (count !== null && count >= 3) {
          setQuotaBlocked(true);
          return;
        }
      } catch {
        setError("Impossible de vérifier votre quota. Réessaie dans quelques instants.");
        return;
      }
    }

    const { data, error: insertError } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user?.id,
        cv_id: config.cvId || null,
        job_title: config.jobTitle,
        sector: config.sector,
        interview_type: config.interviewType,
        difficulty: config.difficulty,
        nb_questions: config.nbQuestions,
        timer_minutes: config.timerMinutes,
      })
      .select('id')
      .single();

    if (insertError || !data) {
      setStarting(false);
      setError("Erreur lors de la création de l'entretien");
      return;
    }

    router.push(`/interview/${data.id}`);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }} className="space-y-5">
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Nouvel entretien</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
          Configurez votre entretien simulé avec l&apos;IA
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>CV à utiliser</label>
            <select value={config.cvId} onChange={(e) => { setConfig({ ...config, cvId: e.target.value }); clearFieldError('cvId'); }}
              style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: fieldErrors.cvId ? '1.5px solid #DC2626' : '0.5px solid #D1D5DB', borderRadius: '8px', background: '#fff', color: '#111827' }}>
              <option value="">Pas de CV (questions génériques)</option>
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>{cv.title}</option>
              ))}
            </select>
            {fieldErrors.cvId && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0', fontSize: '12px', color: '#DC2626' }}>
                <IconAlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                {fieldErrors.cvId}
              </p>
            )}
          </div>

          <div className="md:grid md:grid-cols-2 flex flex-col gap-3" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>Poste visé</label>
              <input type="text" placeholder="Ex: Développeur Full Stack" value={config.jobTitle}
                onChange={(e) => { setConfig({ ...config, jobTitle: e.target.value }); if (fieldErrors.jobTitle) clearFieldError('jobTitle'); }} required
                style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: fieldErrors.jobTitle ? '1.5px solid #DC2626' : '0.5px solid #D1D5DB', borderRadius: '8px', background: '#fff', color: '#111827', outline: 'none' }} />
              {fieldErrors.jobTitle && (
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0', fontSize: '12px', color: '#DC2626' }}>
                  <IconAlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                  {fieldErrors.jobTitle}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>Secteur</label>
              <input type="text" placeholder="Ex: Tech, Finance, Santé..." value={config.sector}
                onChange={(e) => { setConfig({ ...config, sector: e.target.value }); if (fieldErrors.sector) clearFieldError('sector'); }} required
                style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: fieldErrors.sector ? '1.5px solid #DC2626' : '0.5px solid #D1D5DB', borderRadius: '8px', background: '#fff', color: '#111827', outline: 'none' }} />
              {fieldErrors.sector && (
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0', fontSize: '12px', color: '#DC2626' }}>
                  <IconAlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                  {fieldErrors.sector}
                </p>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>Type d'entretien</label>
            <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '10px' }}>
              {interviewTypes.map((type) => {
                const isLocked = plan === 'free' && type.value !== 'technique';
                const isSelected = config.interviewType === type.value;
                return (
                  <button key={type.value} type="button" disabled={isLocked}
                    onClick={() => !isLocked && setConfig({ ...config, interviewType: type.value })}
                    style={{
                      border: isSelected ? '1.5px solid #534AB7' : isLocked ? '0.5px solid #E5E7EB' : '0.5px solid #D1D5DB',
                      borderRadius: '10px', padding: '14px', textAlign: 'left', cursor: isLocked ? 'not-allowed' : 'pointer',
                      background: isSelected ? '#F5F3FF' : isLocked ? '#F9FAFB' : '#fff',
                      opacity: isLocked ? 0.6 : 1, position: 'relative',
                    }}>
                    {isLocked && (
                      <span style={{ position: 'absolute', top: '6px', right: '6px', display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '10px', fontWeight: 500, padding: '1px 6px', borderRadius: '99px', background: '#F3F4F6', color: '#6B7280' }}>
                        <IconLock style={{ width: '10px', height: '10px' }} /> Pro
                      </span>
                    )}
                    <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{type.label}</p>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>{type.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>Difficulté</label>
            <div className="flex flex-wrap" style={{ gap: '8px' }}>
              {difficulties.map((d) => {
                const isSelected = config.difficulty === d.value;
                return (
                  <button key={d.value} type="button" onClick={() => setConfig({ ...config, difficulty: d.value })}
                    style={{
                      flex: 1, padding: '8px 16px', fontSize: '13px', fontWeight: 500, borderRadius: '8px', cursor: 'pointer',
                      border: isSelected ? 'none' : '0.5px solid #D1D5DB',
                      background: isSelected ? '#534AB7' : 'transparent', color: isSelected ? '#fff' : 'inherit',
                    }}>
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row" style={{ gap: '12px' }}>
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>Nombre de questions</label>
              <input type="range" min={1} max={20} value={config.nbQuestions}
                onChange={(e) => setConfig({ ...config, nbQuestions: Number(e.target.value) })}
                style={{ width: '100%' }} />
              <p style={{ fontSize: '13px', textAlign: 'center', marginTop: '4px', color: '#6B7280' }}>{config.nbQuestions} questions</p>
            </div>
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>Timer (minutes)</label>
              <input type="range" min={0} max={60} step={5} value={config.timerMinutes}
                onChange={(e) => setConfig({ ...config, timerMinutes: Number(e.target.value) })}
                style={{ width: '100%' }} />
              <p style={{ fontSize: '13px', textAlign: 'center', marginTop: '4px', color: '#6B7280' }}>
                {config.timerMinutes === 0 ? 'Pas de limite' : `${config.timerMinutes} min`}
              </p>
            </div>
          </div>

          {quotaBlocked ? (
            <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <IconCrownFilled style={{ width: '20px', height: '20px', color: '#534AB7' }} />
              </div>
              <p style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 2px' }}>Limite mensuelle atteinte</p>
              <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5, marginBottom: '12px' }}>
                Tu as utilisé tes 3 entretiens gratuits ce mois-ci. Passe à Pro pour des entretiens illimités.
              </p>
              <Link href="/#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
                Voir les offres Pro
              </Link>
            </div>
          ) : error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: '10px', padding: '12px 14px' }}>
              <IconAlertCircle style={{ width: '18px', height: '18px', color: '#DC2626', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '13px', color: '#991B1B', lineHeight: 1.4 }}>{error}</span>
            </div>
          )}

          <button type="submit" disabled={starting} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px 16px', fontSize: '14px', fontWeight: 500, borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', cursor: starting ? 'not-allowed' : 'pointer', opacity: starting ? 0.6 : 1 }}>
            {starting ? <Spinner size="sm" color="#fff" /> : null}
            Commencer l&apos;entretien
          </button>
        </div>
      </form>
    </div>
  );
}
