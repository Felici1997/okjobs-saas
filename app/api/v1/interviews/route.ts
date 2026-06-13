import { NextRequest } from 'next/server';
import { verifyApiKey, logApiUsage } from '@/lib/api/auth';
import { jsonResponse, errorResponse } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { interviewConfigSchema } from '@/lib/validations/interview';
import { captureServerEvent } from '@/lib/posthog/server';

export async function GET(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.authenticated) return errorResponse(auth.error, auth.status);

  const supabase = createAdminClient();
  const { data: sessions } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('user_id', auth.userId)
    .order('started_at', { ascending: false });

  logApiUsage(auth.apiKeyId, '/api/v1/interviews', 'GET', 200, request.headers.get('x-forwarded-for') || '');

  return jsonResponse({ interviews: sessions || [] });
}

export async function POST(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.authenticated) return errorResponse(auth.error, auth.status);

  const body = await request.json();
  const result = interviewConfigSchema.safeParse(body);
  if (!result.success) {
    return errorResponse(result.error.errors[0].message, 400);
  }

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', auth.userId)
    .single();

  const plan = profile?.plan || 'free';

  if (plan === 'free' && result.data.interviewType !== 'technique') {
    logApiUsage(auth.apiKeyId, '/api/v1/interviews', 'POST', 403, request.headers.get('x-forwarded-for') || '');
    await captureServerEvent('quota_upgrade_blocked', auth.userId, {
      reason: 'non_technique_mode',
      plan,
      interview_type: result.data.interviewType,
    });
    return errorResponse("Le plan gratuit permet uniquement le mode Technique. Passez à Pro pour les modes Comportemental et Motivationnel.", 403);
  }

  if (plan === 'free') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('interview_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth.userId)
      .eq('status', 'completed')
      .gte('started_at', startOfMonth.toISOString());

    if (count !== null && count >= 3) {
      logApiUsage(auth.apiKeyId, '/api/v1/interviews', 'POST', 403, request.headers.get('x-forwarded-for') || '');
      await captureServerEvent('quota_reached', auth.userId, {
        plan,
        interview_count: count,
        limit: 3,
      });
      return errorResponse("Limite de 3 entretiens gratuits atteinte ce mois-ci. Passez à Pro pour des entretiens illimités.", 403);
    }
  }

  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({
      user_id: auth.userId,
      cv_id: result.data.cvId || null,
      job_title: result.data.jobTitle,
      sector: result.data.sector,
      interview_type: result.data.interviewType,
      difficulty: result.data.difficulty,
      nb_questions: result.data.nbQuestions,
      timer_minutes: result.data.timerMinutes,
    })
    .select('*')
    .single();

  logApiUsage(auth.apiKeyId, '/api/v1/interviews', 'POST', error ? 400 : 201, request.headers.get('x-forwarded-for') || '');

  if (error || !data) return errorResponse("Erreur lors de la création", 400);

  return jsonResponse({ interview: data }, 201);
}
