import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateChatCompletion, OpenRouterMessage } from '@/lib/openrouter/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { message } = await request.json();
    const supabase = createAdminClient();

    const { data: session } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json({ error: 'Session terminée' }, { status: 400 });
    }

    if (message) {
      await supabase.from('interview_messages').insert({
        session_id: id,
        role: 'user',
        content: message,
      });
    }

    const { data: messages } = await supabase
      .from('interview_messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    const userMsgCount = messages?.filter((m) => m.role === 'user').length ?? 0;
    const isFirstQuestion = !message;

    let cvContext = '';
    if (session.cv_id) {
      const { data: cv } = await supabase
        .from('cv_documents')
        .select('*')
        .eq('id', session.cv_id)
        .single();
      if (cv) {
        cvContext = `CV du candidat :
Prénom Nom : ${cv.personal_details?.fullName || ''}
Poste recherché : ${cv.personal_details?.postSeeking || ''}
Description : ${cv.personal_details?.description || ''}
Expériences : ${JSON.stringify(cv.experiences || [])}
Formations : ${JSON.stringify(cv.educations || [])}
Compétences : ${JSON.stringify(cv.skills || [])}
Langues : ${JSON.stringify(cv.languages || [])}`;
      }
    }

    const systemPrompt = `Tu es un recruteur qui mène un entretien de type "${session.interview_type}" en français.
Poste visé : ${session.job_title}
Secteur : ${session.sector}
Niveau : ${session.difficulty}
Nombre de questions prévu : ${session.nb_questions}
${cvContext}

Règles :
- Sois professionnel mais bienveillant.
- Pose une question à la fois.
- N'utilise PAS de markdown, pas d'astérisques ni de gras.
- Pour la première question, commence par saluer le candidat et rappeler le contexte (poste, type d'entretien) avant de poser la première question.
- Après chaque réponse du candidat, donne un bref retour (1-2 phrases) puis pose la question suivante.
- Ne répète pas les questions déjà posées.
- Continue jusqu'à ce que je t'arrête. Ne termine pas l'entretien toi-même.`;

    const conversation: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (!isFirstQuestion) {
      conversation.push({
        role: 'system',
        content: `Tu as déjà posé ${userMsgCount} questions sur ${session.nb_questions}. Continue l'entretien normalement.`,
      });
    }

    if (messages) {
      for (const msg of messages) {
        conversation.push({ role: msg.role, content: msg.content });
      }
    }

    const aiMessage = await generateChatCompletion(conversation, 0.7, 1024);

    const isDone = userMsgCount >= session.nb_questions;

    const cleanMessage = aiMessage
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .trim();

    await supabase.from('interview_messages').insert({
      session_id: id,
      role: 'assistant',
      content: cleanMessage || "Pose la question suivante.",
    });

    if (isDone) {
      await supabase
        .from('interview_sessions')
        .update({ status: 'completed', ended_at: new Date().toISOString() })
        .eq('id', id);
    }

    return NextResponse.json({
      message: cleanMessage || "Pose la question suivante.",
      done: isDone,
      questionNumber: userMsgCount + 1,
      totalQuestions: session.nb_questions,
    });
  } catch {
    return NextResponse.json(
      { error: "L'assistant est momentanément indisponible. Réessaie dans quelques instants." },
      { status: 503 }
    );
  }
}
