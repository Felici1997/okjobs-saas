import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const admin = createAdminClient();

    const { data: assessment, error: assessError } = await admin
      .from('skills_assessments')
      .insert({ user_id: user.id, status: 'in_progress', started_at: new Date().toISOString() })
      .select()
      .single();

    if (assessError) throw new Error(assessError.message);

    const { data: questions, error: qError } = await admin
      .from('skills_assessment_questions')
      .select('*, skills_assessment_categories(name)')
      .order('order_num', { ascending: true });

    if (qError) throw new Error(qError.message);

    const grouped = (questions || []).reduce<Record<string, { category: string; questions: { id: string; text: string; orderNum: number }[] }>>((acc, q: any) => {
      const catId = q.category_id;
      if (!acc[catId]) {
        acc[catId] = { category: q.skills_assessment_categories?.name || '', questions: [] };
      }
      acc[catId].questions.push({ id: q.id, text: q.question_text, orderNum: q.order_num });
      return acc;
    }, {});

    return NextResponse.json({ assessment: { id: assessment.id }, categories: Object.values(grouped) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors du démarrage' },
      { status: 500 }
    );
  }
}
