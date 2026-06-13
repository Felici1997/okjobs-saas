import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateStructuredOutput } from '@/lib/openrouter/client';
import { captureServerEvent } from '@/lib/posthog/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan === 'free') {
      captureServerEvent('quota_upgrade_blocked', user.id, {
        reason: 'pdf_import',
        plan: 'free',
      });
      return NextResponse.json(
        { error: 'Import PDF réservé aux membres Pro. Passez à Pro pour débloquer cette fonctionnalité.' },
        { status: 403 }
      );
    }

    const { pdfText } = await request.json();

    if (!pdfText || typeof pdfText !== 'string') {
      return NextResponse.json({ error: 'pdfText requis' }, { status: 400 });
    }

    const result = await generateStructuredOutput<{
      personalDetails: Record<string, string>;
      experiences: Record<string, string>[];
      educations: Record<string, string>[];
      skills: { name: string }[];
      languages: { language: string; proficiency: string }[];
      hobbies: { name: string }[];
    }>(
      `Tu es un extracteur de CV. Analyse le texte fourni et retourne UNIQUEMENT un objet JSON valide (sans markdown) avec cette structure exacte :
{
  "personalDetails": { "fullName": "", "email": "", "phone": "", "address": "", "postSeeking": "", "description": "" },
  "experiences": [{ "jobTitle": "", "companyName": "", "startDate": "", "endDate": "", "description": "" }],
  "educations": [{ "school": "", "degree": "", "startDate": "", "endDate": "", "description": "" }],
  "skills": [{ "name": "" }],
  "languages": [{ "language": "", "proficiency": "" }],
  "hobbies": [{ "name": "" }]
}
Remplis chaque champ avec les données trouvées. Mets des chaînes vides si une section est absente.`,
      `Extrais les informations de ce CV :\n\n${pdfText.substring(0, 15000)}`
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "L'assistant est momentanément indisponible. Réessaie dans quelques instants." },
      { status: 503 }
    );
  }
}
