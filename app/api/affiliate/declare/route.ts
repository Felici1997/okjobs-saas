import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { declareConversionSchema } from '@/lib/validations/affiliate';

export async function POST(request: NextRequest) {
  try {
    const centerKey = request.headers.get('x-center-key');
    if (!centerKey) {
      return NextResponse.json({ error: 'Clé centre requise (header x-center-key)' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: center } = await admin
      .from('training_centers')
      .select('id')
      .eq('id', centerKey)
      .eq('is_active', true)
      .single();

    if (!center) {
      return NextResponse.json({ error: 'Centre non reconnu ou inactif' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = declareConversionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { data: existing } = await admin
      .from('affiliate_codes')
      .select('*, training_programs!inner(price), training_centers!inner(name)')
      .eq('code', parsed.data.code)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Code introuvable' }, { status: 404 });
    }
    if (existing.status !== 'generated' && existing.status !== 'sent' && existing.status !== 'presented') {
      return NextResponse.json({ error: 'Ce code a déjà été traité' }, { status: 409 });
    }
    if (existing.center_id !== center.id) {
      return NextResponse.json({ error: 'Ce code ne correspond pas à votre centre' }, { status: 403 });
    }

    const { data: updated, error } = await admin
      .from('affiliate_codes')
      .update({ status: 'converted' })
      .eq('id', existing.id)
      .select('*, training_programs(title, price), training_centers(name)')
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      code: updated.code,
      commissionAmount: updated.commission_amount,
      program: updated.training_programs.title,
      center: updated.training_centers.name,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors de la déclaration' },
      { status: 500 }
    );
  }
}
