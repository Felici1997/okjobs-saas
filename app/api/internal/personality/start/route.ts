import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const admin = createAdminClient();

    const { data: session, error: sessionError } = await admin
      .from('personality_test_sessions')
      .insert({ user_id: user.id, status: 'in_progress' })
      .select()
      .single();

    if (sessionError) throw new Error(sessionError.message);

    const { data: questions, error: qError } = await admin
      .from('personality_test_questions')
      .select('id, trait, question_text, order_num')
      .eq('is_active', true)
      .order('order_num', { ascending: true });

    if (qError) throw new Error(qError.message);

    return NextResponse.json({
      session: { id: session.id },
      questions,
      totalQuestions: questions?.length || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors du démarrage' },
      { status: 500 }
    );
  }
}
