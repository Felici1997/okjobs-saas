import { createClient } from '@/lib/supabase/client';

type Module = 'cognitive_test' | 'skills_assessment' | 'personality_test' | 'interview';

const moduleTables: Record<Module, string> = {
  cognitive_test: 'cognitive_test_sessions',
  skills_assessment: 'skills_assessments',
  personality_test: 'personality_test_sessions',
  interview: 'interview_sessions',
};

export async function checkOnboardingNeeded(userId: string, module: Module): Promise<boolean> {
  const supabase = createClient();

  const table = moduleTables[module];

  const { count: sessionCount } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });

  if (sessionCount && sessionCount > 0) return false;

  const { data: flag } = await supabase
    .from('user_onboarding_flags')
    .select('id')
    .eq('user_id', userId)
    .eq('module', module)
    .maybeSingle();

  return !flag;
}

export async function dismissOnboarding(userId: string, module: Module): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('user_onboarding_flags')
    .insert({ user_id: userId, module })
    .select();
}
