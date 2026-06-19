import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import BilanOnboardingCheck from '@/app/components/BilanOnboardingCheck';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
  in_progress: 'En cours',
  completed: 'Terminé',
};

function getGlobalScore(a: any) {
  return a.overall_score ?? null;
}

export default async function BilanPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: assessments } = await admin
    .from('skills_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <BilanOnboardingCheck />
      <div style={{ maxWidth: '720px', margin: '0 auto' }} className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Bilan de compétences</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
            Évaluez vos compétences professionnelles
          </p>
        </div>
        <Link href="/bilan/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
          Nouveau bilan
        </Link>
      </div>

      {(!assessments || assessments.length === 0) ? (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 6px' }}>Aucun bilan pour le moment</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: '0 0 16px' }}>
            Réalisez un bilan de compétences pour identifier vos forces et axes d&apos;amélioration.
          </p>
          <Link href="/bilan/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
            Commencer le bilan
          </Link>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score global</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rapport</th>
                <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a: any) => {
                const globalScore = getGlobalScore(a);
                const statusColor = a.status === 'completed' ? '#639922' : '#BA7517';
                const statusBg = a.status === 'completed' ? '#F0F7E6' : '#FFF8E6';

                return (
                  <tr key={a.id} style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                    <td style={{ padding: '12px 14px', fontSize: '14px', color: '#6B7280' }}>
                      {new Date(a.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-flex', fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '99px', background: statusBg, color: statusColor }}>
                        {statusLabels[a.status] || a.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '14px' }}>
                      {globalScore !== null ? (
                        <span style={{ fontWeight: 600, color: globalScore >= 70 ? '#639922' : globalScore >= 40 ? '#BA7517' : '#DC2626' }}>
                          {globalScore}%
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#9CA3AF' }}>
                      {a.completed_at ? new Date(a.completed_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {a.status === 'in_progress' && (
                        <Link href={`/bilan/new?id=${a.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#534AB7', color: '#fff', textDecoration: 'none' }}>
                          Continuer
                        </Link>
                      )}
                      {a.status === 'completed' && (
                        <Link href={`/bilan/${a.id}/results`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', border: '0.5px solid #D1D5DB', background: 'transparent', color: '#374151', textDecoration: 'none' }}>
                          Voir résultats
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}
