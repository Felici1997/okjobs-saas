import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  if (request.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('affiliate_codes')
      .update({ status: 'expired' })
      .in('status', ['generated', 'sent', 'presented'])
      .lt('expires_at', new Date().toISOString())
      .select();

    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      codesExpires: data?.length || 0,
      executed_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de l\'expiration des codes' },
      { status: 500 }
    );
  }
}
