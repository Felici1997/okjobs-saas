import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateStructuredOutput } from '@/lib/openrouter/client';
import { captureServerEvent } from '@/lib/posthog/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: session } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    }

    await supabase
      .from('interview_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', id);

    const { data: messages } = await supabase
      .from('interview_messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    const history = (messages || [])
      .map((m) => `${m.role === 'assistant' ? 'Assistant' : 'Candidat'} : ${m.content}`)
      .join('\n\n');

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', session.user_id)
      .single();

    const isFree = profile?.plan === 'free';

    type FeedbackResult = {
      score: number;
      summary: string;
      strengths?: string[];
      weaknesses?: string[];
      recommendations?: string[];
    };

    const feedback = isFree
      ? await generateStructuredOutput<FeedbackResult>(
          `Tu es un coach en recrutement. Analyse l'entretien et retourne UNIQUEMENT un objet JSON valide (sans markdown) :
{
  "score": <0-100>,
  "summary": "<résumé court 1-2 phrases>"
}`,
          `Voici le transcript de l'entretien. Génère le feedback JSON basique :

${history}`
        )
      : await generateStructuredOutput<FeedbackResult>(
          `Tu es un coach en recrutement. Analyse l'entretien et retourne UNIQUEMENT un objet JSON valide (sans markdown) :
{
  "score": <0-100>,
  "summary": "<résumé 2-3 phrases>",
  "strengths": ["point fort 1", "point fort 2", "point fort 3"],
  "weaknesses": ["point faible 1", "point faible 2", "point faible 3"],
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3"]
}`,
          `Voici le transcript de l'entretien. Génère le feedback JSON :

${history}`
        );

    await supabase.from('interview_feedback').insert({
      session_id: id,
      summary: feedback.summary || '',
      strengths: isFree ? [] : (feedback.strengths || []),
      weaknesses: isFree ? [] : (feedback.weaknesses || []),
      recommendations: isFree ? [] : (feedback.recommendations || []),
      score: feedback.score || 0,
    });

    await supabase
      .from('interview_sessions')
      .update({
        status: 'completed',
        score: feedback.score || 0,
        ended_at: new Date().toISOString(),
      })
      .eq('id', id);

    await captureServerEvent('feedback_generated', session.user_id, {
      plan: profile?.plan || 'free',
      score: feedback.score || 0,
      is_free: isFree,
    });

    return NextResponse.json({ success: true, score: feedback.score || 0 });
  } catch {
    return NextResponse.json(
      { error: "L'assistant est momentanément indisponible. Réessaie dans quelques instants." },
      { status: 503 }
    );
  }
}
