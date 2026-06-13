import { createAdminClient } from '@/lib/supabase/admin';

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
};

export async function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_ms: windowMs,
    });

    if (!data) {
      return { allowed: true, remaining: maxRequests };
    }

    return data as RateLimitResult;
  } catch {
    return { allowed: true, remaining: maxRequests };
  }
}

export async function rateLimitHeaders(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60_000
): Promise<Record<string, string>> {
  const result = await checkRateLimit(key, maxRequests, windowMs);
  return {
    'X-RateLimit-Limit': String(maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil((Date.now() + windowMs) / 1000)),
  };
}
