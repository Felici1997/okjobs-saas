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
  const { data: document } = await supabase
    .from('cv_documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .single();

  logApiUsage(auth.apiKeyId, `/api/v1/cv/${id}`, 'GET', document ? 200 : 404, request.headers.get('x-forwarded-for') || '');

  if (!document) return errorResponse('CV introuvable', 404);

  return jsonResponse({ document });
}
