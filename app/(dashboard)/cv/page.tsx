'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { IconPlus, IconFileDescription, IconExternalLink, IconUpload, IconTrash } from '@tabler/icons-react';
import Spinner from '@/app/components/Spinner';

export default function CVPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [cvs, setCvs] = useState<{ id: string; title: string; is_active: boolean; updated_at: string }[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadCvs = () => {
    if (!user) return;
    supabase
      .from('cv_documents')
      .select('id, title, is_active, updated_at')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (data) setCvs(data);
      });
  };

  useEffect(() => {
    loadCvs();
  }, [user, supabase]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }} className="space-y-4">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Mon CV</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
            Gérez vos CV et personnalisez vos entretiens
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/cv/import" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #D1D5DB', background: 'transparent', color: 'inherit', textDecoration: 'none' }}>
            <IconUpload style={{ width: '15px', height: '15px' }} />
            Importer
          </Link>
          <Link href="/cv/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
            <IconPlus style={{ width: '15px', height: '15px' }} />
            Nouveau CV
          </Link>
        </div>
      </div>

      {cvs.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <IconFileDescription style={{ width: '26px', height: '26px', color: '#3C3489' }} />
          </div>
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>Aucun CV pour le moment</p>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Créez votre premier CV pour que l&apos;IA puisse personnaliser vos entretiens
          </p>
          <Link href="/cv/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
            <IconPlus style={{ width: '15px', height: '15px' }} />
            Créer mon CV
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {cvs.map((cv) => (
            <div key={cv.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconFileDescription style={{ width: '20px', height: '20px', color: '#3C3489' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: 0 }}>{cv.title}</p>
                    {cv.is_active && (
                      <span style={{ fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '99px', background: '#EEEDFE', color: '#3C3489' }}>Actif</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0' }}>
                    Modifié le {new Date(cv.updated_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <Link href={`/cv/${cv.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 14px', borderRadius: '8px', border: '0.5px solid #E5E7EB', background: 'transparent', color: '#6B7280', textDecoration: 'none' }}>
                  <IconExternalLink style={{ width: '15px', height: '15px' }} />
                  Modifier
                </Link>
                <button
                  onClick={async () => {
                    setDeleting(cv.id);
                    await supabase.from('cv_documents').delete().eq('id', cv.id);
                    loadCvs();
                    setDeleting(null);
                  }}
                  disabled={deleting === cv.id}
                  aria-label="Supprimer ce CV"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '0.5px solid #E5E7EB', background: 'transparent', color: '#A32D2D', cursor: deleting === cv.id ? 'not-allowed' : 'pointer', opacity: deleting === cv.id ? 0.6 : 1 }}
                  onMouseEnter={(e) => { if (deleting !== cv.id) e.currentTarget.style.background = '#FCEBEB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {deleting === cv.id ? <Spinner size="sm" color="#A32D2D" /> : <IconTrash style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
