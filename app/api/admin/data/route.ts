import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const ALLOWED_TABLES = new Set([
  'training_centers',
  'training_programs',
  'affiliate_codes',
  'invoices',
  'invoice_items',
  'profiles',
  'training_recommendations',
  'whatsapp_logs',
]);

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { table, select = '*', filters = {}, orders = [], range, method = 'select' } = await request.json();

    if (!ALLOWED_TABLES.has(table)) {
      return NextResponse.json({ error: 'Table non autorisée' }, { status: 403 });
    }

    let query = admin.from(table).select(select, { count: 'exact' });

    const applyFilters = (f: Record<string, unknown>) => {
      for (const [key, val] of Object.entries(f)) {
        if (key === 'eq' || key === 'gte' || key === 'lte' || key === 'lt' || key === 'in' || key === 'or') continue;
        if (typeof val === 'string' && val.startsWith('__range__')) {
          continue;
        }
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).eq(key, val);
      }
    };

    if (filters.eq) {
      for (const [col, val] of Object.entries(filters.eq as Record<string, unknown>)) {
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).eq(col, val);
      }
    }
    if (filters.in) {
      for (const [col, vals] of Object.entries(filters.in as Record<string, string[]>)) {
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).in(col, vals);
      }
    }
    if (filters.gte) {
      for (const [col, val] of Object.entries(filters.gte as Record<string, string>)) {
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).gte(col, val);
      }
    }
    if (filters.lte) {
      for (const [col, val] of Object.entries(filters.lte as Record<string, string>)) {
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).lte(col, val);
      }
    }
    if (filters.lt) {
      for (const [col, val] of Object.entries(filters.lt as Record<string, string>)) {
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).lt(col, val);
      }
    }
    if (filters.or) {
      (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).or(filters.or as string);
    }

    const structuredKeys = new Set(['eq', 'in', 'gte', 'lte', 'lt', 'or']);
    for (const [key, val] of Object.entries(filters)) {
      if (structuredKeys.has(key)) continue;
      if (key.startsWith('gte:')) {
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).gte(key.slice(4), val as string);
      } else if (key.startsWith('lte:')) {
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).lte(key.slice(4), val as string);
      } else if (key.startsWith('lt:')) {
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).lt(key.slice(3), val as string);
      } else if (key.startsWith('in:')) {
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).in(key.slice(3), val as string[]);
      } else {
        (query as ReturnType<typeof query>) = (query as ReturnType<typeof query>).eq(key, val);
      }
    }
    for (const order of orders) {
      const { column, ascending = false, nullsFirst } = order;
      query = (query as ReturnType<typeof query>).order(column, { ascending, nullsFirst });
    }
    if (range) {
      query = (query as ReturnType<typeof query>).range(range.from, range.to);
    }

    if (method === 'select') {
      const { data, error, count } = await (query as ReturnType<typeof query>);
      if (error) throw error;
      return NextResponse.json({ data, count });
    }

    if (method === 'insert') {
      const { data, error } = await admin.from(table).insert(filters.data).select();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (method === 'update') {
      const { data, error } = await admin
        .from(table)
        .update(filters.set)
        .eq(filters.whereCol, filters.whereVal)
        .select();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: 'Méthode non supportée' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur' },
      { status: 500 }
    );
  }
}
