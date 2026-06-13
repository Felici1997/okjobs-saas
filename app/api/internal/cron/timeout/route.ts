import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  if (request.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase.rpc('timeout_stale_sessions');

    return NextResponse.json({
      success: true,
      sessions_impactees: data ?? 0,
      executed_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage des sessions' },
      { status: 500 }
    );
  }
}
