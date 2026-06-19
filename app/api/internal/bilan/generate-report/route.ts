import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateBilanReportSchema } from '@/lib/validations/tests-and-bilan';
import { buildSkillsReportPrompt } from '@/lib/openrouter/prompts';
import { generateStructuredOutput } from '@/lib/openrouter/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const body = await request.json();
    const parsed = generateBilanReportSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const admin = createAdminClient();

    const { data: assessment } = await admin
      .from('skills_assessments')
      .select('*')
      .eq('id', parsed.data.assessmentId)
      .eq('user_id', user.id)
      .single();

    if (!assessment) return NextResponse.json({ error: 'Bilan introuvable' }, { status: 404 });
    if (assessment.status !== 'completed') return NextResponse.json({ error: 'Bilan pas encore complété' }, { status: 400 });

    const { data: answersData } = await admin
      .from('skills_assessment_answers')
      .select('rating, question_id')
      .eq('assessment_id', parsed.data.assessmentId);

    const { data: questionsLookup } = await admin
      .from('skills_assessment_questions')
      .select('id, question_text, category_id, skills_assessment_categories(name)');

    const lookupMap = new Map((questionsLookup || []).map((q: any) => [q.id, q]));

    const answers = (answersData || []).map((a: any) => {
      const q = lookupMap.get(a.question_id);
      return {
        rating: a.rating,
        skills_assessment_questions: {
          question_text: q?.question_text || '',
          skills_assessment_categories: { name: (q as any)?.skills_assessment_categories?.name || '' },
        },
      };
    });

    const { data: programs } = await admin
      .from('training_programs')
      .select('id, title, category, description');

    const { data: latestCv } = await admin
      .from('cvs')
      .select('resume_text')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: result } = await admin
      .from('skills_assessment_results')
      .select('category_scores')
      .eq('assessment_id', parsed.data.assessmentId)
      .maybeSingle();

    const categoryScores = result?.category_scores
      ? Object.entries(result.category_scores as Record<string, number>)
          .map(([slug, score]) => `${slug}: ${score}`)
          .join('\n')
      : 'N/A';

    const answersText = (answers || []).map((a: any, i: number) =>
      `${i + 1}. [${a.skills_assessment_questions?.skills_assessment_categories?.name || ''}] ${a.skills_assessment_questions?.question_text || ''} → Note: ${a.rating}/5`
    ).join('\n');

    const programsText = (programs || []).map((p: any) =>
      `ID: ${p.id} | ${p.title} (${p.category}) — ${p.description}`
    ).join('\n');

    const cvContext = latestCv?.resume_text || '';

    const report = await generateStructuredOutput<{
      globalSummary: string;
      strengths: string[];
      areasForImprovement: string[];
      trainingRecommendations: { programId: string; reason: string }[];
    }>(
      buildSkillsReportPrompt(categoryScores, answersText, programsText, cvContext).system,
      buildSkillsReportPrompt(categoryScores, answersText, programsText, cvContext).user,
    );

    await admin
      .from('skills_assessment_results')
      .update({
        global_summary: report.globalSummary,
        strengths: report.strengths,
        areas_for_improvement: report.areasForImprovement,
        training_gap_analysis: report.trainingRecommendations,
      })
      .eq('assessment_id', parsed.data.assessmentId);

    if (report.trainingRecommendations?.length) {
      const { data: existingRecs } = await admin
        .from('training_recommendations')
        .select('program_id')
        .eq('assessment_id', parsed.data.assessmentId);

      const existingIds = new Set((existingRecs || []).map((r: any) => r.program_id));

      const newRecs = report.trainingRecommendations
        .filter((r: any) => !existingIds.has(r.programId))
        .map((r: any) => ({
          user_id: user.id,
          assessment_id: parsed.data.assessmentId,
          program_id: r.programId,
          reason: r.reason,
          status: 'recommended',
        }));

      if (newRecs.length) {
        const { error: recError } = await admin.from('training_recommendations').insert(newRecs);
        if (recError) console.error('Failed to insert recommendations:', recError);
      }
    }

    return NextResponse.json({ report });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors de la génération du rapport' },
      { status: 500 }
    );
  }
}
