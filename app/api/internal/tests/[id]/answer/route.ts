import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { answerQuestionSchema } from '@/lib/validations/tests-and-bilan';
import { buildIQQuestionPrompt } from '@/lib/openrouter/prompts';
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
    if (session.status !== 'in_progress') return NextResponse.json({ error: 'Test déjà terminé' }, { status: 400 });

    const body = await request.json();
    const parsed = answerQuestionSchema.safeParse({ ...body, sessionId: id });
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const { questionId, answerIndex } = parsed.data;

    const { data: question } = await admin
      .from('cognitive_test_questions')
      .select('*')
      .eq('id', questionId)
      .eq('session_id', id)
      .single();

    if (!question) return NextResponse.json({ error: 'Question introuvable' }, { status: 404 });

    const isCorrect = answerIndex === question.correct_index;
    await admin.from('cognitive_test_questions').update({ user_answer_index: answerIndex, is_correct: isCorrect }).eq('id', questionId);

    const nextQuestionNum = session.current_question + 1;
    const isLastQuestion = nextQuestionNum >= session.question_count;

    if (isLastQuestion) {
      const answeredQuestions = await admin
        .from('cognitive_test_questions')
        .select('*')
        .eq('session_id', id)
        .order('order_num', { ascending: true });

      const correctCount = (answeredQuestions.data || []).filter((q: { is_correct: boolean }) => q.is_correct).length;
      const maxScore = (answeredQuestions.data || []).reduce((sum: number, q: { points: number }) => sum + q.points, 0);

      await admin
        .from('cognitive_test_sessions')
        .update({
          status: 'completed',
          current_question: nextQuestionNum,
          score: correctCount,
          max_score: maxScore,
          ended_at: new Date().toISOString(),
        })
        .eq('id', id);

      return NextResponse.json({
        completed: true,
        answer: { isCorrect, correctIndex: question.correct_index, explanation: question.explanation },
      });
    }

    const previousQuestions = (await admin
      .from('cognitive_test_questions')
      .select('question_text, user_answer_index, correct_index')
      .eq('session_id', id)
      .order('order_num', { ascending: true })).data || [];

    const prevQsText = previousQuestions
      .map((q: { question_text: string; user_answer_index: number | null; correct_index: number }, i: number) =>
        `Q${i + 1}: ${q.question_text} | Réponse: ${q.user_answer_index !== null ? q.user_answer_index : 'pas encore répondu'} | Correcte: ${q.correct_index}`
      ).join('\n');

    const prompt = buildIQQuestionPrompt(session.category, session.difficulty, nextQuestionNum + 1, session.question_count, prevQsText);
    const questionData = await generateStructuredOutput<{ question: string; options: string[]; correctIndex: number; explanation: string }>(
      prompt.system,
      prompt.user,
    );

    const { data: newQuestion } = await admin
      .from('cognitive_test_questions')
      .insert({
        session_id: id,
        question_text: questionData.question,
        options: questionData.options,
        correct_index: questionData.correctIndex,
        explanation: questionData.explanation,
        difficulty: session.difficulty,
        points: 1,
        order_num: nextQuestionNum + 1,
      })
      .select()
      .single();

    await admin
      .from('cognitive_test_sessions')
      .update({ current_question: nextQuestionNum })
      .eq('id', id);

    return NextResponse.json({
      completed: false,
      answer: { isCorrect, correctIndex: question.correct_index, explanation: question.explanation },
      nextQuestion: newQuestion
        ? {
            id: newQuestion.id,
            text: newQuestion.question_text,
            options: newQuestion.options,
            orderNum: newQuestion.order_num,
          }
        : null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors de la réponse' },
      { status: 500 }
    );
  }
}
