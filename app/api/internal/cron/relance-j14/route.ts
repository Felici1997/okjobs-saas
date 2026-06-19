import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendRelanceJ14 } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  if (request.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data: codes } = await supabase
      .from('affiliate_codes')
      .select('id, code, user_id, training_centers!inner(name), profiles!inner(phone)')
      .eq('status', 'sent')
      .lte('sent_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

    if (!codes || codes.length === 0) {
      return NextResponse.json({ success: true, relancesEnvoyees: 0 });
    }

    let sent = 0;
    for (const code of codes) {
      const phone = (code.profiles as unknown as { phone: string }).phone;
      const centerName = (code.training_centers as unknown as { name: string }).name;
      if (phone) {
        await sendRelanceJ14({
          phone,
          centerName,
          affiliateCodeId: code.id,
          userId: code.user_id,
        });
        sent++;
      }
    }

    return NextResponse.json({
      success: true,
      relancesEnvoyees: sent,
      executed_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des relances' },
      { status: 500 }
    );
  }
}
