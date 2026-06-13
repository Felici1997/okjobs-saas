'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { Key, Copy, Check, Trash2, Plus } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clés API</h1>
        <p className="text-base-content/60 mt-1">
          Gérez vos clés d'API pour utiliser Okjobs depuis des services externes
        </p>
      </div>

      {/* Create key */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Créer une clé</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nom de la clé (ex: Mon app RH)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="input input-bordered flex-1"
            />
            <button onClick={createKey} className="btn btn-primary" disabled={!newKeyName.trim()}>
              <Plus className="w-4" />
              Créer
            </button>
          </div>

          {copiedKey && (
            <div className="alert alert-success mt-4">
              <Check className="w-4" />
              <span className="text-sm break-all">
                Clé créée : <strong>{copiedKey}</strong>
                <br />
                Copiez-la maintenant, elle ne sera plus jamais affichée.
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(copiedKey);
                }}
                className="btn btn-sm"
              >
                <Copy className="w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Keys list */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Mes clés</h2>
          {apiKeys.length === 0 ? (
            <p className="text-base-content/60 text-sm py-4">Aucune clé d'API créée.</p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    key.revoked ? 'border-error/30 bg-error/5' : 'border-base-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Key className={`w-5 ${key.revoked ? 'text-error' : 'text-primary'}`} />
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-base-content/60 font-mono">
                        {key.key_prefix}
                      </p>
                      <p className="text-xs text-base-content/40">
                        Créée le {new Date(key.created_at).toLocaleDateString('fr-FR')}
                        {key.last_used_at && ` · Dernière utilisation : ${new Date(key.last_used_at).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {key.revoked ? (
                      <span className="badge badge-error badge-sm">Révoquée</span>
                    ) : (
                      <button
                        onClick={() => revokeKey(key.id)}
                        className="btn btn-ghost btn-sm text-error"
                        title="Révoquer"
                      >
                        <Trash2 className="w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
