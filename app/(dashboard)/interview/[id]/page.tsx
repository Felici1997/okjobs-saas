'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Timer from '@/app/components/Timer';
import { Send, Loader2, Square, MessageSquare, User } from 'lucide-react';

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

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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
    setSending(true);
    try {
      await fetch(`/api/internal/interview/${id}/end`, { method: 'POST' });
      router.push(`/interview/${id}/feedback`);
    } catch {
      setError("Erreur lors de la fin de l'entretien");
      setSending(false);
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const typeLabel: Record<string, string> = {
    technique: 'Technique',
    comportemental: 'Comportemental',
    motivationnel: 'Motivationnel',
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-base-100 rounded-t-box border border-base-300">
        <div>
          <h1 className="font-bold">{session.job_title}</h1>
          <div className="flex gap-2 mt-1">
            <span className="badge badge-sm">
              {typeLabel[session.interview_type] || session.interview_type}
            </span>
            <span className="badge badge-sm badge-outline capitalize">
              {session.difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Timer minutes={session.timer_minutes} onExpired={handleTimerExpired} />
          <button
            onClick={handleEnd}
            disabled={sending}
            className="btn btn-error btn-sm"
          >
            <Square className="w-3" />
            Terminer
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-base-100 border-x border-base-300 space-y-4">
        {messages.length === 0 && !sending && (
          <div className="flex items-center justify-center h-full text-base-content/40">
            <p>Préparation de l&apos;entretien...</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <MessageSquare className="w-4" />
                </div>
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-content rounded-br-md'
                  : 'bg-base-300 rounded-bl-md'
              }`}
            >
              {stripMarkdown(msg.content)}
            </div>
            {msg.role === 'user' && (
              <div className="avatar placeholder">
                <div className="bg-secondary text-secondary-content rounded-full w-8">
                  <User className="w-4" />
                </div>
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-8">
                <MessageSquare className="w-4" />
              </div>
            </div>
            <div className="bg-base-300 rounded-2xl rounded-bl-md px-4 py-3">
              <span className="loading loading-dots loading-sm" />
            </div>
          </div>
        )}

        {done && (
          <div className="text-center py-4">
            <p className="text-base-content/60 mb-2">Entretien terminé</p>
            <button
              onClick={() => router.push(`/interview/${id}/feedback`)}
              className="btn btn-primary"
            >
              Voir le feedback
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-sm py-2">{error}</div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      {!done && (
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 p-4 bg-base-100 border border-base-300 rounded-b-box"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Votre réponse..."
            className="input input-bordered flex-1"
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <Loader2 className="w-4 animate-spin" />
            ) : (
              <Send className="w-4" />
            )}
            Envoyer
          </button>
        </form>
      )}
    </div>
  );
}
