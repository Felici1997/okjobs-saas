import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitBilanSchema } from '@/lib/validations/tests-and-bilan';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const body = await request.json();
    const parsed = submitBilanSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const admin = createAdminClient();

    const { data: assessment } = await admin
      .from('skills_assessments')
      .select('*')
      .eq('id', parsed.data.assessmentId)
      .eq('user_id', user.id)
      .single();

    if (!assessment) return NextResponse.json({ error: 'Bilan introuvable' }, { status: 404 });
    if (assessment.status !== 'in_progress') return NextResponse.json({ error: 'Bilan déjà terminé' }, { status: 400 });

    const answersData = parsed.data.answers.map((a) => ({
      assessment_id: parsed.data.assessmentId,
      question_id: a.questionId,
      rating: a.rating,
    }));

    const { error: insertError } = await admin
      .from('skills_assessment_answers')
      .insert(answersData);

    if (insertError) throw new Error(insertError.message);

    const { data: questions } = await admin
      .from('skills_assessment_questions')
      .select('id, category_id, skills_assessment_categories(name)');

    const { data: savedAnswers } = await admin
      .from('skills_assessment_answers')
      .select('question_id, rating')
      .eq('assessment_id', parsed.data.assessmentId);

    const categoryRatings: Record<string, number[]> = {};
    const categoryNames: Record<string, string> = {};

    (questions || []).forEach((q: any) => {
      const catId = q.category_id;
      const catName = q.skills_assessment_categories?.name || '';
      if (!categoryRatings[catId]) { categoryRatings[catId] = []; categoryNames[catId] = catName; }
    });

    (savedAnswers || []).forEach((a: any) => {
      const q = (questions || []).find((qq: any) => qq.id === a.question_id);
      if (q) categoryRatings[q.category_id]?.push(a.rating);
    });

    const scores: Record<string, { category: string; score: number }> = {};
    Object.entries(categoryRatings).forEach(([catId, ratings]) => {
      const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      scores[catId] = { category: categoryNames[catId] || '', score: Math.round(avg * 20) };
    });

    const categoryScoresJson: Record<string, number> = {};
    Object.entries(scores).forEach(([catId, data]) => {
      const slug = data.category.toLowerCase().replace(/\s+/g, '_');
      categoryScoresJson[slug] = data.score;
    });

    const overallScore = Object.values(categoryScoresJson).length > 0
      ? Math.round(Object.values(categoryScoresJson).reduce((a, b) => a + b, 0) / Object.values(categoryScoresJson).length)
      : null;

    await admin
      .from('skills_assessments')
      .update({ status: 'completed', completed_at: new Date().toISOString(), overall_score: overallScore })
      .eq('id', parsed.data.assessmentId);

    const { data: existingResult } = await admin
      .from('skills_assessment_results')
      .select('id')
      .eq('assessment_id', parsed.data.assessmentId)
      .maybeSingle();

    if (existingResult) {
      await admin
        .from('skills_assessment_results')
        .update({ category_scores: categoryScoresJson })
        .eq('assessment_id', parsed.data.assessmentId);
    } else {
      await admin
        .from('skills_assessment_results')
        .insert({ assessment_id: parsed.data.assessmentId, category_scores: categoryScoresJson });
    }

    return NextResponse.json({ scores: categoryScoresJson, overallScore, assessmentId: parsed.data.assessmentId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors de la soumission' },
      { status: 500 }
    );
  }
}
