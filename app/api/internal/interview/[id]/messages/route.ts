import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const [sessionResult, messagesResult] = await Promise.all([
      supabase.from('interview_sessions').select('*').eq('id', id).single(),
      supabase
        .from('interview_messages')
        .select('*')
        .eq('session_id', id)
        .order('created_at', { ascending: true }),
    ]);

    if (sessionResult.error || !sessionResult.data) {
      return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      session: sessionResult.data,
      messages: messagesResult.data || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du chargement des messages." },
      { status: 500 }
    );
  }
}
