import { NextRequest } from 'next/server';
import { verifyApiKey, logApiUsage } from '@/lib/api/auth';
import { jsonResponse, errorResponse } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.authenticated) return errorResponse(auth.error, auth.status);

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.userId)
    .single();

  logApiUsage(auth.apiKeyId, '/api/v1/profile', 'GET', 200, request.headers.get('x-forwarded-for') || '');

  if (!profile) return errorResponse('Profil introuvable', 404);

  return jsonResponse({ profile });
}
