import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('is_admin, email')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      isAdmin: profile?.is_admin === true,
      email: profile?.email || user.email,
    });
  } catch {
    return NextResponse.json({ isAdmin: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
