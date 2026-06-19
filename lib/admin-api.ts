type ApiAdminSelect = {
  table: string;
  select?: string;
  filters?: Record<string, unknown>;
  orders?: { column: string; ascending?: boolean }[];
  range?: { from: number; to: number };
};

type ApiAdminInsert = {
  table: string;
  method: 'insert';
  data: Record<string, unknown>;
};

type ApiAdminUpdate = {
  table: string;
  method: 'update';
  set: Record<string, unknown>;
  whereCol: string;
  whereVal: string;
};

type ApiAdminCall = ApiAdminSelect | ApiAdminInsert | ApiAdminUpdate;

export async function apiAdmin(call: ApiAdminCall) {
  const res = await fetch('/api/admin/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(call),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erreur API admin');
  }
  return res.json();
}

