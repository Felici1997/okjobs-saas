import { NextRequest } from 'next/server';
import { verifyApiKey, logApiUsage } from '@/lib/api/auth';
import { jsonResponse, errorResponse } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyApiKey(request);
  if (!auth.authenticated) return errorResponse(auth.error, auth.status);

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from('interview_sessions')
    .select('id')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .single();

  if (!session) return errorResponse('Entretien introuvable', 404);

  const { data: messages } = await supabase
    .from('interview_messages')
    .select('*')
    .eq('session_id', id)
    .order('created_at', { ascending: true });

  logApiUsage(auth.apiKeyId, `/api/v1/interviews/${id}/messages`, 'GET', 200, request.headers.get('x-forwarded-for') || '');

  return jsonResponse({ messages: messages || [] });
}
