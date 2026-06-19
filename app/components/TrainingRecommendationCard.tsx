'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { IconBuildingStore, IconCoin, IconClock, IconArrowRight, IconCheck } from '@tabler/icons-react';
import LoadingButton from '@/app/components/LoadingButton';

type Program = {
  id: string;
  center_id: string;
  title: string;
  category: string;
  price: number;
  duration: string | null;
  training_centers: { id: string; name: string };
};

type Props = {
  sessionId: string;
  jobTitle: string;
  sector: string;
};

const categoryLabels: Record<string, string> = {
  bureautique: 'Bureautique',
  comptabilite: 'Comptabilité',
  dev: 'Développement',
  langues: 'Langues',
};

export default function TrainingRecommendationCard({ sessionId, jobTitle, sector }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('training_programs')
      .select('*, training_centers!inner(id, name)')
      .eq('training_centers.is_active', true)
      .eq('is_active', true)
      .order('price', { ascending: true })
      .then(({ data }) => {
        if (data) {
          const matching = data.filter((p) => {
            const cat = p.category.toLowerCase();
            const sectorLower = sector.toLowerCase();
            if (cat === 'dev' && (sectorLower.includes('tech') || sectorLower.includes('informatiqu') || sectorLower.includes('dev'))) return true;
            if (cat === 'comptabilite' && (sectorLower.includes('compta') || sectorLower.includes('finan') || sectorLower.includes('audit'))) return true;
            if (cat === 'bureautique') return true;
            if (cat === 'langues') return true;
            return false;
          });
          setPrograms(matching.slice(0, 3));
        }
        setLoading(false);
      });
  }, [supabase, sector]);

  const handleInterest = async (programId: string, centerId: string) => {
    setGenerating(programId);
    try {
      const res = await fetch('/api/affiliate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, centerId }),
      });
      const data = await res.json();
      if (res.ok) {
        setGenerated(data.code);
        supabase.from('training_recommendations').insert({
          session_id: sessionId,
          program_id: programId,
          affiliate_code_id: data.id,
        }).then(() => {});
      }
    } catch {
      // silent
    } finally {
      setGenerating(null);
    }
  };

  if (loading || programs.length === 0) return null;

  return (
    <div>
      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', borderLeft: '3px solid #085041' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#085041', margin: '0 0 12px' }}>
          <IconBuildingStore style={{ width: '16px', height: '16px' }} />
          Formations recommandées pour {jobTitle}
        </h2>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px' }}>
          Renforcez vos compétences avec nos centres partenaires
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {programs.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 12px', background: '#F9FAFB', borderRadius: '8px', border: '0.5px solid #E5E7EB' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: 0 }}>{p.title}</p>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0' }}>
                  {p.training_centers.name}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '10px', color: '#6B7280' }}>
                    <IconCoin style={{ width: '10px', height: '10px' }} />
                    {p.price.toLocaleString('fr-FR')} FCFA
                  </span>
                  {p.duration && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '10px', color: '#6B7280' }}>
                      <IconClock style={{ width: '10px', height: '10px' }} />
                      {p.duration}
                    </span>
                  )}
                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '99px', background: '#E6F1FB', color: '#0C447C' }}>
                    {categoryLabels[p.category] || p.category}
                  </span>
                </div>
              </div>
              {generated === p.id ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, color: '#085041', whiteSpace: 'nowrap' }}>
                  <IconCheck style={{ width: '14px', height: '14px' }} />
                  Code envoyé
                </span>
              ) : (
                <LoadingButton
                  onClick={() => handleInterest(p.id, p.center_id)}
                  loading={generating === p.id}
                  variant="primary"
                  icon={<IconArrowRight style={{ width: '12px', height: '12px' }} />}
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                >
                  Je suis intéressé(e)
                </LoadingButton>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
