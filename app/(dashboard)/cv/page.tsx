'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, FileText, ExternalLink, Upload, Trash2 } from 'lucide-react';

export default function CVPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [cvs, setCvs] = useState<{ id: string; title: string; is_active: boolean; updated_at: string }[]>([]);

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mon CV</h1>
          <p className="text-base-content/60 mt-1">
            Gérez vos CV et personnalisez vos entretiens
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/cv/import" className="btn btn-outline">
            <Upload className="w-4" />
            Importer
          </Link>
          <Link href="/cv/new" className="btn btn-primary">
            <Plus className="w-4" />
            Nouveau CV
          </Link>
        </div>
      </div>

      {cvs.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body items-center text-center py-16">
            <FileText className="w-16 h-16 text-base-content/20 mb-4" />
            <h3 className="text-lg font-medium">Aucun CV pour le moment</h3>
            <p className="text-base-content/60 mt-1 mb-6">
              Créez votre premier CV pour que l'IA puisse personnaliser vos entretiens
            </p>
            <Link href="/cv/new" className="btn btn-primary">
              <Plus className="w-4" />
              Créer mon CV
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {cvs.map((cv) => (
            <div key={cv.id} className="card bg-base-100 shadow-sm">
              <div className="card-body flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 text-primary" />
                  <div>
                    <h3 className="font-bold">{cv.title}</h3>
                    <p className="text-sm text-base-content/60">
                      Modifié le {new Date(cv.updated_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {cv.is_active && (
                    <span className="badge badge-primary badge-sm">Actif</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/cv/${cv.id}`} className="btn btn-ghost btn-sm">
                    <ExternalLink className="w-4" />
                    Modifier
                  </Link>
                  <button
                    onClick={async () => {
                      await supabase.from('cv_documents').delete().eq('id', cv.id);
                      loadCvs();
                    }}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    <Trash2 className="w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
