'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { Upload, FileText, Loader2, ArrowLeft, Crown } from 'lucide-react';
import Link from 'next/link';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function ImportCVPage() {
  const { user, plan } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!file || !user) return;
    setExtracting(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      const text = fullText.trim();
      if (!text) throw new Error('Aucun texte lisible dans ce PDF. Vérifie que le fichier contient bien du texte sélectionnable.');

      const response = await fetch('/api/internal/openrouter/extract-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfText: text }),
      });

      if (!response.ok) throw new Error("Erreur d'extraction");

      const data = await response.json();

      const { data: cvData, error: insertError } = await supabase
        .from('cv_documents')
        .insert({
          user_id: user.id,
          title: `CV - ${data.personalDetails?.fullName || file.name}`,
          is_active: true,
          personal_details: data.personalDetails || {},
          experiences: data.experiences || [],
          educations: data.educations || [],
          skills: data.skills || [],
          languages: data.languages || [],
          hobbies: data.hobbies || [],
        })
        .select('id')
        .single();

      if (insertError || !cvData) throw new Error('Erreur lors de la création du CV');

      router.push(`/cv/${cvData.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'extraction"
      );
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cv" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4" />
          Retour
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Importer un CV</h1>
          <p className="text-base-content/60 mt-1">
            Téléchargez votre CV (PDF) et laissez l'IA extraire les informations
          </p>
        </div>
      </div>

      {plan === 'free' ? (
        <div className="card bg-gradient-to-br from-primary/5 to-brand-blue/5 border-2 border-primary/20">
          <div className="card-body items-center text-center py-12">
            <div className="p-3 bg-primary/10 rounded-full mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Import PDF réservé aux membres Pro</h3>
            <p className="text-sm text-base-content/60 mt-2 max-w-md">
              Téléchargez votre CV au format PDF et laissez l'IA extraire automatiquement vos informations pour créer un CV structuré en quelques secondes.
            </p>
            <Link href="/#pricing" className="btn btn-primary mt-6">
              Voir les offres Pro
            </Link>
          </div>
        </div>
      ) : (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f && f.type === 'application/pdf') setFile(f);
            }}
            className="border-2 border-dashed border-base-300 rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('pdf-upload')?.click()}
          >
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            {file ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 mx-auto text-primary" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-base-content/60">
                  {(file.size / 1024).toFixed(0)} Ko
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-base-content/30" />
                <p className="font-medium">
                  Glissez votre CV ici ou cliquez pour parcourir
                </p>
                <p className="text-sm text-base-content/60">PDF uniquement</p>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="btn btn-primary w-full mt-4"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 animate-spin" />
                  Extraction en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4" />
                  Extraire et créer le CV
                </>
              )}
            </button>
          )}

          {error && <div className="alert alert-error text-sm mt-4">{error}</div>}
        </div>
      </div>
      )}
    </div>
  );
}
