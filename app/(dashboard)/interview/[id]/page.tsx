'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Timer from '@/app/components/Timer';
import LoadingButton from '@/app/components/LoadingButton';
import { IconSend, IconLoader2, IconSquare, IconMessage2, IconUser, IconAlertCircle } from '@tabler/icons-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
}

export default function InterviewChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const firstQuestionSent = useRef(false);

  const rawId = params.id;
  const id = typeof rawId === 'string' ? rawId : '';

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [session, setSession] = useState<{
    job_title: string;
    interview_type: string;
    difficulty: string;
    nb_questions: number;
    timer_minutes: number;
    status: string;
  } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !id) return;

    fetch(`/api/internal/interview/${id}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push('/interview');
          return;
        }
        setSession(data.session);
        setMessages(data.messages);

        if (data.session.status !== 'in_progress') {
          setDone(true);
          if (data.session.status === 'completed') {
            router.push(`/interview/${id}/feedback`);
          }
        }

        setLoading(false);

        if (data.messages.length === 0 && !firstQuestionSent.current) {
          firstQuestionSent.current = true;
          sendMessage('');
        }
      });
  }, [user, id, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msg: string) => {
    setSending(true);
    setError('');

    try {
      const res = await fetch(`/api/internal/interview/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      const { data: newMessages } = await supabase
        .from('interview_messages')
        .select('*')
        .eq('session_id', id)
        .order('created_at', { ascending: true });

      if (newMessages) setMessages(newMessages);

      if (data.done) {
        setDone(true);
        fetch(`/api/internal/interview/${id}/end`, { method: 'POST' });
      }
    } catch {
      setError("Erreur de communication");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || done) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleEnd = async () => {
    setEnding(true);
    try {
      await fetch(`/api/internal/interview/${id}/end`, { method: 'POST' });
      router.push(`/interview/${id}/feedback`);
    } catch {
      setError("Erreur lors de la fin de l'entretien");
      setEnding(false);
    }
  };

  const handleTimerExpired = async () => {
    setDone(true);
    try {
      await supabase
        .from('interview_sessions')
        .update({ status: 'timeout', ended_at: new Date().toISOString() })
        .eq('id', id);
      await fetch(`/api/internal/interview/${id}/end`, { method: 'POST' });
      router.push(`/interview/${id}/feedback`);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 className="w-8 h-8 animate-spin" style={{ color: '#534AB7' }} />
      </div>
    );
  }

  if (!session) return null;

  const typeLabel: Record<string, string> = {
    technique: 'Technique',
    comportemental: 'Comportemental',
    motivationnel: 'Motivationnel',
  };
  const typeColors: Record<string, { bg: string; text: string }> = {
    technique: { bg: '#E6F1FB', text: '#0C447C' },
    comportemental: { bg: '#EEEDFE', text: '#3C3489' },
    motivationnel: { bg: '#E1F5EE', text: '#085041' },
  };
  const tc = typeColors[session.interview_type] || { bg: '#F3F4F6', text: '#6B7280' };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 6rem)' }} className="px-0 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ padding: '12px 16px', background: '#fff', border: '0.5px solid #E5E7EB', borderBottom: 'none', borderRadius: '12px 12px 0 0', gap: '10px' }}>
        <div className="min-w-0 flex-1">
          <h1 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }} className="truncate">{session.job_title}</h1>
          <div className="flex flex-wrap" style={{ gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, padding: '1px 8px', borderRadius: '99px', background: tc.bg, color: tc.text }}>
              {typeLabel[session.interview_type] || session.interview_type}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 500, padding: '1px 8px', borderRadius: '99px', border: '0.5px solid #D1D5DB', textTransform: 'capitalize' }}>
              {session.difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end" style={{ gap: '10px' }}>
          <Timer minutes={session.timer_minutes} onExpired={handleTimerExpired} />
          <LoadingButton onClick={handleEnd} loading={ending} variant="danger"
            style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
            <IconSquare style={{ width: '12px', height: '12px' }} />
            Terminer
          </LoadingButton>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 16px', background: '#fff', borderLeft: '0.5px solid #E5E7EB', borderRight: '0.5px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && !sending && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF' }}>
            <p>Préparation de l&apos;entretien...</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', gap: '10px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconMessage2 style={{ width: '14px', height: '14px', color: '#534AB7' }} />
              </div>
            )}
            <div style={{
              maxWidth: '85%', padding: '10px 14px', fontSize: '14px', lineHeight: 1.5,
              borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: msg.role === 'user' ? '#534AB7' : '#F3F4F6',
              color: msg.role === 'user' ? '#fff' : '#111827',
            }}>
              {stripMarkdown(msg.content)}
            </div>
            {msg.role === 'user' && (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconUser style={{ width: '14px', height: '14px', color: '#6B7280' }} />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconMessage2 style={{ width: '14px', height: '14px', color: '#534AB7' }} />
            </div>
            <div style={{ background: '#F3F4F6', borderRadius: '12px 12px 12px 4px', padding: '10px 14px' }}>
              <span className="loading loading-dots loading-sm" />
            </div>
          </div>
        )}

        {done && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: '#6B7280', marginBottom: '10px', fontSize: '14px' }}>Entretien terminé</p>
            <button onClick={() => router.push(`/interview/${id}/feedback`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', cursor: 'pointer' }}>
              Voir le feedback
            </button>
          </div>
        )}

        {error && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: '10px', padding: '10px 12px' }}>
          <IconAlertCircle style={{ width: '16px', height: '16px', color: '#DC2626', flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '13px', color: '#991B1B', lineHeight: 1.4 }}>{error}</span>
        </div>}

        <div ref={chatEndRef} />
      </div>

      {!done && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: '#fff', border: '0.5px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 12px 12px' }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Votre réponse..."
            disabled={sending} autoFocus
            style={{ flex: 1, padding: '10px 12px', fontSize: '14px', border: '0.5px solid #D1D5DB', borderRadius: '8px', background: '#fff', color: '#111827' }} />
          <LoadingButton type="submit" disabled={!input.trim()} loading={sending} icon={<IconSend style={{ width: '16px', height: '16px' }} />}
            style={{ fontSize: '13px', padding: '10px 16px', borderRadius: '8px' }}>
            <span className="hidden sm:inline">Envoyer</span>
          </LoadingButton>
        </form>
      )}
    </div>
  );
}
