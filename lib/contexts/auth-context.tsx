'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { identifyUser, resetUser } from '@/lib/posthog/client';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  plan: string;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('free');
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        identifyUser(currentUser.id, { email: currentUser.email });
      } else if (event === 'SIGNED_OUT') {
        resetUser();
      }
    });

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      if (currentUser) {
        supabase.from('profiles').select('plan').eq('id', currentUser.id).single().then(({ data }) => {
          if (data) setPlan(data.plan);
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  return (
    <AuthContext.Provider value={{ user, loading, plan, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
