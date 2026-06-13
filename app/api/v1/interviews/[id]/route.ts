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
    .select('*')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .single();

  logApiUsage(auth.apiKeyId, `/api/v1/interviews/${id}`, 'GET', session ? 200 : 404, request.headers.get('x-forwarded-for') || '');

  if (!session) return errorResponse('Entretien introuvable', 404);

  return jsonResponse({ interview: session });
}
