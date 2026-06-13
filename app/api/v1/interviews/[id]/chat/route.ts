import { NextRequest } from 'next/server';
import { verifyApiKey, logApiUsage } from '@/lib/api/auth';
import { jsonResponse, errorResponse } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateChatCompletion, OpenRouterMessage } from '@/lib/openrouter/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyApiKey(request);
  if (!auth.authenticated) return errorResponse(auth.error, auth.status);

  const { id } = await params;
  const { message } = await request.json();
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .single();

  if (!session) return errorResponse('Entretien introuvable', 404);
  if (session.status !== 'in_progress') return errorResponse('Entretien terminé', 400);

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
- Si le candidat a déjà répondu à ${session.nb_questions} questions, annonce que l'entretien est terminé et dis "MERCI_AVOIR_TERMINE".`;

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

  let aiMessage: string;
  try {
    aiMessage = await generateChatCompletion(conversation, 0.7, 1024);
  } catch {
    logApiUsage(auth.apiKeyId, `/api/v1/interviews/${id}/chat`, 'POST', 503, request.headers.get('x-forwarded-for') || '');
    return errorResponse("L'assistant est momentanément indisponible. Réessaie dans quelques instants.", 503);
  }

  logApiUsage(auth.apiKeyId, `/api/v1/interviews/${id}/chat`, 'POST', 200, request.headers.get('x-forwarded-for') || '');

  const isDone = aiMessage.includes('MERCI_AVOIR_TERMINE') || userMsgCount >= session.nb_questions;
    const cleanMessage = aiMessage
      .replace('MERCI_AVOIR_TERMINE', '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .trim();

  await supabase.from('interview_messages').insert({
    session_id: id,
    role: 'assistant',
    content: cleanMessage || "L'entretien est terminé.",
  });

  if (isDone) {
    await supabase
      .from('interview_sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', id);
  }

  return jsonResponse({
    message: cleanMessage || "L'entretien est terminé.",
    done: isDone,
    questionNumber: userMsgCount + 1,
    totalQuestions: session.nb_questions,
  });
}
