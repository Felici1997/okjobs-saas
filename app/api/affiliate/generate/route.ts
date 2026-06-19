import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateCodeSchema } from '@/lib/validations/affiliate';
import { createAffiliateCode } from '@/lib/affiliate';
import { sendAffiliateCodeWhatsApp } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = generateCodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { programId, centerId } = parsed.data;

    const admin = createAdminClient();
    const [{ data: profile }, { data: program }, { data: center }] = await Promise.all([
      admin.from('profiles').select('phone').eq('id', user.id).single(),
      admin.from('training_programs').select('title').eq('id', programId).single(),
      admin.from('training_centers').select('name').eq('id', centerId).single(),
    ]);

    if (!program || !center) {
      return NextResponse.json({ error: 'Programme ou centre introuvable' }, { status: 404 });
    }

    const affiliateCode = await createAffiliateCode({
      userId: user.id,
      programId,
      centerId,
    });

    sendAffiliateCodeWhatsApp({
      phone: profile?.phone || '',
      code: affiliateCode.code,
      centerName: center.name,
      programTitle: program.title,
      affiliateCodeId: affiliateCode.id,
      userId: user.id,
    });

    return NextResponse.json({
      code: affiliateCode.code,
      id: affiliateCode.id,
      centerName: center.name,
      programTitle: program.title,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors de la génération du code' },
      { status: 500 }
    );
  }
}
