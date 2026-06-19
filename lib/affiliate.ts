import { createAdminClient } from '@/lib/supabase/admin';

export type AffiliateCode = {
  id: string;
  code: string;
  user_id: string;
  program_id: string;
  center_id: string;
  status: string;
  commission_amount: number | null;
  sent_at: string | null;
  presented_at: string | null;
  converted_at: string | null;
  confirmed_at: string | null;
  expires_at: string;
  user_confirmation: string | null;
  disputed_at: string | null;
  created_at: string;
};

export type AffiliateCodeWithDetails = AffiliateCode & {
  training_programs: { title: string; price: number; category: string };
  training_centers: { name: string; commission_pct: number };
  profiles: { full_name: string; email: string };
};

const supabase = createAdminClient();

export async function generateCode(): Promise<string> {
  const year = new Date().getFullYear().toString();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string;
  let exists = true;
  do {
    let rand = '';
    for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    code = `OKJ-${year}-${rand}`;
    const { data } = await supabase.from('affiliate_codes').select('id').eq('code', code).maybeSingle();
    exists = !!data;
  } while (exists);
  return code;
}

export async function createAffiliateCode(params: {
  userId: string;
  programId: string;
  centerId: string;
}): Promise<AffiliateCode> {
  const code = await generateCode();
  const { data, error } = await supabase
    .from('affiliate_codes')
    .insert({
      code,
      user_id: params.userId,
      program_id: params.programId,
      center_id: params.centerId,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getAffiliateCode(codeId: string): Promise<AffiliateCodeWithDetails | null> {
  const { data } = await supabase
    .from('affiliate_codes')
    .select('*, training_programs(title, price, category), training_centers(name, commission_pct), profiles(full_name, email)')
    .eq('id', codeId)
    .single();
  return data;
}

export async function updateAffiliateCodeStatus(codeId: string, status: string): Promise<void> {
  const updates: Record<string, string | null> = { status };
  if (status === 'sent') updates.sent_at = new Date().toISOString();
  if (status === 'presented') updates.presented_at = new Date().toISOString();
  if (status === 'converted') updates.converted_at = new Date().toISOString();
  if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
  if (status === 'disputed') updates.disputed_at = new Date().toISOString();

  const { error } = await supabase.from('affiliate_codes').update(updates).eq('id', codeId);
  if (error) throw new Error(error.message);
}

export async function markUserConfirmation(codeId: string, response: 'yes' | 'no'): Promise<void> {
  const { error } = await supabase
    .from('affiliate_codes')
    .update({ user_confirmation: response })
    .eq('id', codeId);
  if (error) throw new Error(error.message);
}

export async function declareConversion(params: {
  code: string;
}): Promise<AffiliateCode> {
  const { data: existing } = await supabase
    .from('affiliate_codes')
    .select('*')
    .eq('code', params.code)
    .single();
  if (!existing) throw new Error('Code introuvable');
  if (existing.status !== 'generated' && existing.status !== 'sent' && existing.status !== 'presented') {
    throw new Error('Ce code a déjà été traité');
  }
  const { data, error } = await supabase
    .from('affiliate_codes')
    .update({ status: 'converted' })
    .eq('id', existing.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getDisputedCodes(): Promise<AffiliateCodeWithDetails[]> {
  const { data } = await supabase
    .from('affiliate_codes')
    .select('*, training_programs(title, price, category), training_centers(name, commission_pct), profiles(full_name, email)')
    .or('status.eq.disputed,and(user_confirmation.eq.yes,status.neq.converted)')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getUserAffiliateCodes(userId: string): Promise<AffiliateCodeWithDetails[]> {
  const { data } = await supabase
    .from('affiliate_codes')
    .select('*, training_programs(title, price, category), training_centers(name, commission_pct)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getMonthlyCommissions(centerId: string, year: number, month: number): Promise<number> {
  const start = new Date(year, month - 1, 1).toISOString();
  const end = new Date(year, month, 0, 23, 59, 59).toISOString();
  const { data } = await supabase
    .from('affiliate_codes')
    .select('commission_amount')
    .eq('center_id', centerId)
    .in('status', ['converted', 'confirmed', 'invoiced'])
    .gte('converted_at', start)
    .lte('converted_at', end);
  return (data || []).reduce((sum, c) => sum + (c.commission_amount || 0), 0);
}

export async function getAllAffiliateCodes(filters?: {
  status?: string;
  centerId?: string;
}): Promise<AffiliateCodeWithDetails[]> {
  let query = supabase
    .from('affiliate_codes')
    .select('*, training_programs(title, price, category), training_centers(name, commission_pct), profiles(full_name, email)')
    .order('created_at', { ascending: false });
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.centerId) query = query.eq('center_id', filters.centerId);
  const { data } = await query;
  return data || [];
}
