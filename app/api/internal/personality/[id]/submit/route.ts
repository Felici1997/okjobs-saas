import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitPersonalityTestSchema } from '@/lib/validations/personality';
import { buildPersonalitySynthesisPrompt } from '@/lib/openrouter/prompts';
import { generateStructuredOutput } from '@/lib/openrouter/client';

const TRAITS = ['ouverture', 'conscienciosite', 'extraversion', 'agreabilite', 'stabilite'] as const;

const traitLabels: Record<string, string> = {
  ouverture: 'Ouverture',
  conscienciosite: 'Conscienciosité',
  extraversion: 'Extraversion',
  agreabilite: 'Agréabilité',
  stabilite: 'Stabilité émotionnelle',
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const body = await request.json();
    const parsed = submitPersonalityTestSchema.safeParse({ ...body, sessionId: id });
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const admin = createAdminClient();

    const { data: session } = await admin
      .from('personality_test_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!session) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    if (session.status !== 'in_progress') return NextResponse.json({ error: 'Test déjà terminé' }, { status: 400 });

    const { data: questions } = await admin
      .from('personality_test_questions')
      .select('id, trait, is_reversed, question_text')
      .eq('is_active', true);

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Questions introuvables' }, { status: 500 });
    }

    const questionMap = new Map(questions.map((q: any) => [q.id, q]));

    const { error: insertError } = await admin
      .from('personality_test_answers')
      .insert(parsed.data.answers.map((a) => ({
        session_id: id,
        question_id: a.questionId,
        rating: a.rating,
      })));

    if (insertError) throw new Error(insertError.message);

    const traitRatings: Record<string, number[]> = {};
    TRAITS.forEach((t) => { traitRatings[t] = []; });

    parsed.data.answers.forEach((a) => {
      const q = questionMap.get(a.questionId);
      if (!q) return;
      const trait = q.trait as string;
      if (!traitRatings[trait]) return;
      const effectiveRating = q.is_reversed ? (6 - a.rating) : a.rating;
      traitRatings[trait].push(effectiveRating);
    });

    const traitScores: Record<string, number> = {};
    TRAITS.forEach((t) => {
      const ratings = traitRatings[t];
      if (ratings.length === 0) { traitScores[t] = 50; return; }
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      traitScores[t] = Math.round(((avg - 1) / 4) * 100);
    });

    await admin
      .from('personality_test_sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', id);

    const { data: programs } = await admin
      .from('training_programs')
      .select('id, title, category, description');

    const programsText = (programs || []).map((p: any) =>
      `ID: ${p.id} | ${p.title} (${p.category}) — ${p.description}`
    ).join('\n');

    const traitScoresText = TRAITS.map((t) => `${traitLabels[t]}: ${traitScores[t]}/100`).join('\n');

    const traitDetailsText = parsed.data.answers.map((a) => {
      const q = questionMap.get(a.questionId);
      return `[${traitLabels[q?.trait || '']}] ${q?.question_text || ''} → ${a.rating}/5${q?.is_reversed ? ' (inversé)' : ''}`;
    }).join('\n');

    const prompt = buildPersonalitySynthesisPrompt(traitScoresText, traitDetailsText, programsText);
    const synthesis = await generateStructuredOutput<{
      profileType: string;
      workEnvironments: string[];
      strengths: string[];
      developmentAxes: string[];
      recommendedRoles: string[];
      teamFit: string;
      trainingRecommendations: { programId: string; reason: string }[];
    }>(prompt.system, prompt.user);

    await admin.from('personality_test_results').insert({
      session_id: id,
      user_id: user.id,
      trait_scores: traitScores,
      profile_type: synthesis.profileType,
      work_environments: synthesis.workEnvironments,
      strengths: synthesis.strengths,
      development_axes: synthesis.developmentAxes,
      recommended_roles: synthesis.recommendedRoles,
      team_fit: synthesis.teamFit,
    });

    if (synthesis.trainingRecommendations?.length) {
      const { data: existingRecs } = await admin
        .from('training_recommendations')
        .select('program_id')
        .eq('personality_test_id', id);

      const existingIds = new Set((existingRecs || []).map((r: any) => r.program_id));

      const newRecs = synthesis.trainingRecommendations
        .filter((r: any) => !existingIds.has(r.programId))
        .map((r: any) => ({
          user_id: user.id,
          personality_test_id: id,
          program_id: r.programId,
          reason: r.reason,
          status: 'recommended',
        }));

      if (newRecs.length) {
        await admin.from('training_recommendations').insert(newRecs);
      }
    }

    return NextResponse.json({
      scores: traitScores,
      synthesis,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors de la soumission' },
      { status: 500 }
    );
  }
}
