import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { startTestSchema } from '@/lib/validations/tests-and-bilan';
import { buildIQQuestionPrompt } from '@/lib/openrouter/prompts';
import { generateStructuredOutput } from '@/lib/openrouter/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const body = await request.json();
    const parsed = startTestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const { category, difficulty, questionCount, timeLimitMinutes } = parsed.data;

    const admin = createAdminClient();
    const { data: session, error: sessionError } = await admin
      .from('cognitive_test_sessions')
      .insert({ user_id: user.id, category, difficulty, question_count: questionCount, time_limit_minutes: timeLimitMinutes })
      .select()
      .single();

    if (sessionError) throw new Error(sessionError.message);

    const prompt = buildIQQuestionPrompt(category, difficulty, 1, questionCount, '');
    const questionData = await generateStructuredOutput<{ question: string; options: string[]; correctIndex: number; explanation: string }>(
      prompt.system,
      prompt.user,
    );

    const { data: question, error: questionError } = await admin
      .from('cognitive_test_questions')
      .insert({
        session_id: session.id,
        question_text: questionData.question,
        options: questionData.options,
        correct_index: questionData.correctIndex,
        explanation: questionData.explanation,
        difficulty,
        points: 1,
        order_num: 1,
      })
      .select()
      .single();

    if (questionError) throw new Error(questionError.message);

    return NextResponse.json({
      session,
      question: {
        id: question.id,
        text: question.question_text,
        options: question.options,
        orderNum: question.order_num,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors du démarrage du test' },
      { status: 500 }
    );
  }
}
