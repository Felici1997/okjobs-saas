import { NextRequest } from 'next/server';
import { verifyApiKey, logApiUsage } from '@/lib/api/auth';
import { jsonResponse, errorResponse } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.authenticated) return errorResponse(auth.error, auth.status);

  const supabase = createAdminClient();
  const { data: documents } = await supabase
    .from('cv_documents')
    .select('*')
    .eq('user_id', auth.userId)
    .order('updated_at', { ascending: false });

  logApiUsage(auth.apiKeyId, '/api/v1/cv', 'GET', 200, request.headers.get('x-forwarded-for') || '');

  return jsonResponse({ documents: documents || [] });
}
