import { createAdminClient } from '@/lib/supabase/admin';

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 60;

async function checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.rpc('check_rate_limit', {
      p_key: `api:${key}`,
      p_max_requests: RATE_LIMIT_MAX,
      p_window_ms: RATE_LIMIT_WINDOW,
    });

    if (!data || !data.allowed) {
      return { allowed: false, remaining: 0, resetAt: Date.now() + RATE_LIMIT_WINDOW };
    }

    return { allowed: true, remaining: data.remaining, resetAt: Date.now() + RATE_LIMIT_WINDOW };
  } catch {
    return { allowed: true, remaining: RATE_LIMIT_MAX, resetAt: Date.now() + RATE_LIMIT_WINDOW };
  }
}

type AuthResult = {
  authenticated: true;
  userId: string;
  apiKeyId: string;
} | {
  authenticated: false;
  error: string;
  status: number;
};

export async function verifyApiKey(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Clé API manquante. Utilisez Authorization: Bearer <votre_clé>', status: 401 };
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey.startsWith('okj_')) {
    return { authenticated: false, error: 'Format de clé API invalide', status: 401 };
  }

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  const supabase = createAdminClient();
  const { data: apiKey } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('key_hash', keyHash)
    .eq('revoked', false)
    .single();

  if (!apiKey) {
    return { authenticated: false, error: 'Clé API invalide ou révoquée', status: 401 };
  }

  const rl = await checkRateLimit(apiKey.id);
  if (!rl.allowed) {
    return { authenticated: false, error: 'Trop de requêtes. Limite : 60 requêtes/minute', status: 429 };
  }

  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKey.id);

  return { authenticated: true, userId: apiKey.user_id, apiKeyId: apiKey.id };
}

export async function logApiUsage(apiKeyId: string, endpoint: string, method: string, status: number, ip: string) {
  const supabase = createAdminClient();
  await supabase.from('api_usage_logs').insert({
    api_key_id: apiKeyId,
    endpoint,
    method,
    status,
    ip,
  });
}
