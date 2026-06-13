'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { interviewConfigSchema } from '@/lib/validations/interview';
import { Lock, Crown } from 'lucide-react';
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

  const [config, setConfig] = useState({
    cvId: '',
    jobTitle: '',
    sector: '',
    interviewType: 'technique' as InterviewType,
    difficulty: 'intermediaire' as Difficulty,
    nbQuestions: 5,
    timerMinutes: 0,
  });
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
    setError('');

    const result = interviewConfigSchema.safeParse(config);
    if (!result.success) {
      setError(result.error.errors[0].message);
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
      setError("Erreur lors de la création de l'entretien");
      return;
    }

    router.push(`/interview/${data.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvel entretien</h1>
        <p className="text-base-content/60 mt-1">
          Configurez votre entretien simulé avec l'IA
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm">
        <div className="card-body space-y-6">
          {/* CV selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">CV à utiliser</span>
            </label>
            <select
              value={config.cvId}
              onChange={(e) => setConfig({ ...config, cvId: e.target.value })}
              className="select select-bordered w-full"
            >
              <option value="">Pas de CV (questions génériques)</option>
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.title}
                </option>
              ))}
            </select>
          </div>

          {/* Job info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Poste visé</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Développeur Full Stack"
                value={config.jobTitle}
                onChange={(e) => setConfig({ ...config, jobTitle: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Secteur</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Tech, Finance, Santé..."
                value={config.sector}
                onChange={(e) => setConfig({ ...config, sector: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>

          {/* Interview type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Type d'entretien</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {interviewTypes.map((type) => {
                const isLocked = plan === 'free' && type.value !== 'technique';
                return (
                  <button
                    key={type.value}
                    type="button"
                    disabled={isLocked}
                    onClick={() => !isLocked && setConfig({ ...config, interviewType: type.value })}
                    className={`border-2 rounded-xl p-4 text-left transition-all relative ${
                      config.interviewType === type.value
                        ? 'border-primary bg-primary/5'
                        : isLocked
                        ? 'border-base-200 bg-base-100 opacity-60 cursor-not-allowed'
                        : 'border-base-300 hover:border-base-content/30'
                    }`}
                  >
                    {isLocked && (
                      <span className="absolute top-2 right-2 badge badge-ghost badge-xs gap-1">
                        <Lock className="w-3 h-3" /> Pro
                      </span>
                    )}
                    <h3 className="font-bold">{type.label}</h3>
                    <p className="text-sm text-base-content/60 mt-1">{type.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Difficulté</span>
            </label>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setConfig({ ...config, difficulty: d.value })}
                  className={`btn flex-1 ${
                    config.difficulty === d.value ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Questions & Timer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nombre de questions</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={config.nbQuestions}
                onChange={(e) => setConfig({ ...config, nbQuestions: Number(e.target.value) })}
                className="range range-primary range-sm"
              />
              <span className="text-sm text-center mt-1">{config.nbQuestions} questions</span>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Timer (minutes)</span>
              </label>
              <input
                type="range"
                min={0}
                max={60}
                step={5}
                value={config.timerMinutes}
                onChange={(e) => setConfig({ ...config, timerMinutes: Number(e.target.value) })}
                className="range range-primary range-sm"
              />
              <span className="text-sm text-center mt-1">
                {config.timerMinutes === 0 ? 'Pas de limite' : `${config.timerMinutes} min`}
              </span>
            </div>
          </div>

          {quotaBlocked ? (
            <div className="card bg-gradient-to-br from-primary/5 to-brand-blue/5 border-2 border-primary/20">
              <div className="card-body items-center text-center py-8">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Limite mensuelle atteinte</h3>
                <p className="text-sm text-base-content/60 mt-2 max-w-sm">
                  Tu as utilisé tes 3 entretiens gratuits ce mois-ci. Passe à Pro pour des entretiens illimités et des fonctionnalités avancées.
                </p>
                <Link href="/#pricing" className="btn btn-primary mt-6">
                  Voir les offres Pro
                </Link>
              </div>
            </div>
          ) : error && <div className="alert alert-error text-sm py-2">{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg w-full">
            Commencer l'entretien
          </button>
        </div>
      </form>
    </div>
  );
}
