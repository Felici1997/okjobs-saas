import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitTestSchema } from '@/lib/validations/tests-and-bilan';
import { buildIQEvaluationPrompt } from '@/lib/openrouter/prompts';
import { generateStructuredOutput } from '@/lib/openrouter/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const admin = createAdminClient();
    const { data: session } = await admin
      .from('cognitive_test_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!session) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });

    const { data: questions } = await admin
      .from('cognitive_test_questions')
      .select('*')
      .eq('session_id', id)
      .order('order_num', { ascending: true });

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Aucune question trouvée' }, { status: 404 });
    }

    if (session.status === 'in_progress') {
      const correctCount = questions.filter((q: { is_correct: boolean }) => q.is_correct).length;
      const maxScore = questions.reduce((sum: number, q: { points: number }) => sum + q.points, 0);
      await admin
        .from('cognitive_test_sessions')
        .update({
          status: 'completed',
          score: correctCount,
          max_score: maxScore,
          ended_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    const qaText = questions
      .map((q: { question_text: string; options: string[]; correct_index: number; user_answer_index: number | null; explanation: string }, i: number) =>
        `Q${i + 1}: ${q.question_text}\nOptions: ${q.options.join(', ')}\nRép. correcte: ${q.correct_index}\nRép. utilisateur: ${q.user_answer_index !== null ? q.user_answer_index : 'pas réponse'}\nExplication: ${q.explanation}`
      ).join('\n\n');

    const prompt = buildIQEvaluationPrompt(session.category, qaText);
    const evaluation = await generateStructuredOutput<{
      score: number;
      summary: string;
      strengths: string[];
      weaknesses: string[];
      categoryBreakdown: Record<string, number>;
    }>(prompt.system, prompt.user);

    return NextResponse.json({
      evaluation,
      session: {
        score: session.score ?? questions.filter((q: { is_correct: boolean }) => q.is_correct).length,
        maxScore: session.max_score ?? questions.length,
        questionCount: questions.length,
        category: session.category,
        timeLimitMinutes: session.time_limit_minutes,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors de la génération du rapport' },
      { status: 500 }
    );
  }
}
