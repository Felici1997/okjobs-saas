import { NextRequest } from 'next/server';
import { verifyApiKey, logApiUsage } from '@/lib/api/auth';
import { jsonResponse, errorResponse } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateStructuredOutput } from '@/lib/openrouter/client';
import { captureServerEvent } from '@/lib/posthog/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyApiKey(request);
  if (!auth.authenticated) return errorResponse(auth.error, auth.status);

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .single();

  if (!session) return errorResponse('Entretien introuvable', 404);

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

  try {
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('id', auth.apiKeyId)
      .single();

    const { data: profile } = apiKey
      ? await supabase.from('profiles').select('plan').eq('id', apiKey.user_id).single()
      : { data: null };

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

    logApiUsage(auth.apiKeyId, `/api/v1/interviews/${id}/end`, 'POST', 200, request.headers.get('x-forwarded-for') || '');

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
      .update({ status: 'completed', score: feedback.score || 0, ended_at: new Date().toISOString() })
      .eq('id', id);

    captureServerEvent('feedback_generated', auth.userId, {
      plan: profile?.plan || 'free',
      score: feedback.score || 0,
      is_free: isFree,
      source: 'api_v1',
    });

    return jsonResponse({ success: true, score: feedback.score || 0 });
  } catch {
    logApiUsage(auth.apiKeyId, `/api/v1/interviews/${id}/end`, 'POST', 502, request.headers.get('x-forwarded-for') || '');
    captureServerEvent('openrouter_error', auth.userId, {
      endpoint: 'api/v1/interviews/end',
    });
    return errorResponse("L'assistant est momentanément indisponible. Réessaie dans quelques instants.", 503);
  }
}
