'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { IconKey, IconCopy, IconCheck, IconTrash, IconPlus } from '@tabler/icons-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; key_prefix: string; created_at: string; revoked: boolean; last_used_at: string | null }[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadKeys = () => {
    if (!user) return;
    supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setApiKeys(data);
      });
  };

  useEffect(() => {
    loadKeys();
  }, [user, supabase]);

  const createKey = async () => {
    if (!newKeyName.trim()) return;

    const rawKey = `okj_${crypto.randomUUID().replace(/-/g, '')}`;
    const prefix = rawKey.substring(0, 12) + '...';

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase.from('api_keys').insert({
      user_id: user?.id,
      key_hash: keyHash,
      key_prefix: prefix,
      name: newKeyName.trim(),
    });

    if (!error) {
      setCopiedKey(rawKey);
      setNewKeyName('');
      loadKeys();
      setTimeout(() => setCopiedKey(null), 5000);
    }
  };

  const revokeKey = async (id: string) => {
    await supabase.from('api_keys').update({ revoked: true }).eq('id', id);
    loadKeys();
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="space-y-5">
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 500, margin: 0 }}>Clés API</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
          Gérez vos clés d&apos;API pour utiliser Okjobs depuis des services externes
        </p>
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#111827', marginBottom: '10px' }}>Créer une clé</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" placeholder="Nom de la clé (ex: Mon app RH)" value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', fontSize: '14px', border: '0.5px solid #D1D5DB', borderRadius: '8px', background: '#fff', color: '#111827' }} />
          <button onClick={createKey} disabled={!newKeyName.trim()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', cursor: 'pointer' }}>
            <IconPlus style={{ width: '15px', height: '15px' }} />
            Créer
          </button>
        </div>

        {copiedKey && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '14px', background: '#E1F5EE', border: '0.5px solid #A7D4C5', borderRadius: '8px', padding: '10px 12px' }}>
            <IconCheck style={{ width: '14px', height: '14px', color: '#085041', flexShrink: 0, marginTop: '1px' }} />
            <div style={{ flex: 1, fontSize: '13px', color: '#085041' }}>
              Clé créée : <strong>{copiedKey}</strong><br />
              Copiez-la maintenant, elle ne sera plus jamais affichée.
            </div>
            <button onClick={() => navigator.clipboard.writeText(copiedKey)}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '6px', border: '0.5px solid #A7D4C5', background: 'transparent', color: '#085041', cursor: 'pointer', flexShrink: 0 }}>
              <IconCopy style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#111827', marginBottom: '10px' }}>Mes clés</h2>
        {apiKeys.length === 0 ? (
          <p style={{ color: '#9CA3AF', fontSize: '13px', padding: '12px 0', margin: 0 }}>Aucune clé d&apos;API créée.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {apiKeys.map((key) => (
              <div key={key.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px', border: '0.5px solid', borderColor: key.revoked ? '#FCA5A5' : '#E5E7EB', background: key.revoked ? '#FEF2F2' : '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <IconKey style={{ width: '18px', height: '18px', flexShrink: 0, color: key.revoked ? '#E24B4A' : '#534AB7' }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: 0 }}>{key.name}</p>
                    <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'monospace', margin: '1px 0' }}>{key.key_prefix}</p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                      Créée le {new Date(key.created_at).toLocaleDateString('fr-FR')}
                      {key.last_used_at && ` · Dernière utilisation : ${new Date(key.last_used_at).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {key.revoked ? (
                    <span style={{ fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '99px', background: '#FCEBEB', color: '#791F1F' }}>Révoquée</span>
                  ) : (
                    <button onClick={() => revokeKey(key.id)} title="Révoquer"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: '0.5px solid #E5E7EB', background: 'transparent', color: '#A32D2D', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FCEBEB'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      <IconTrash style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
