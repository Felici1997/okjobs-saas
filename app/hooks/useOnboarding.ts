'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

export type Module = 'cognitive_test' | 'skills_assessment' | 'personality_test' | 'interview';

const moduleTables: Record<Module, string> = {
  cognitive_test: 'cognitive_test_sessions',
  skills_assessment: 'skills_assessments',
  personality_test: 'personality_test_sessions',
  interview: 'interview_sessions',
};

export function useOnboarding(module: Module) {
  const { user } = useAuth();
  const supabaseRef = useRef(createClient());
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const check = async () => {
      const supabase = supabaseRef.current;
      const table = moduleTables[module];

      const { count } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true });

      if (cancelled) return;

      if (count && count > 0) {
        setChecking(false);
        return;
      }

      const { data: flag } = await supabase
        .from('user_onboarding_flags')
        .select('id')
        .eq('user_id', user.id)
        .eq('module', module)
        .maybeSingle();

      if (cancelled) return;
      if (!flag) setShowModal(true);
      setChecking(false);
    };
    check();
    return () => { cancelled = true; };
  }, [user, module]);

  const dismiss = useCallback(async () => {
    if (!user) return;
    await supabaseRef.current
      .from('user_onboarding_flags')
      .insert({ user_id: user.id, module })
      .select();
    setShowModal(false);
  }, [user, module]);

  return { showModal, checking, dismiss };
}
