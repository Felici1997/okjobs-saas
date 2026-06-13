# Migration Plan Free → Pro (Stripe)

## Source de vérité

**Règle n°1 : `profiles.plan` est la source de vérité jusqu'à ce que Stripe soit en production.**

Pendant la phase MVP :
- `plan` est défini manuellement via Supabase Dashboard (`UPDATE profiles SET plan = 'pro' WHERE ...`)
- La colonne `plan` est le seul endroit qui détermine les fonctionnalités débloquées
- Le frontend et les API lisent `profiles.plan` — rien d'autre

## Lors de l'arrivée de Stripe

### Étape 1 — Stripe Customer + Subscription créés

```
Webhook Stripe `customer.subscription.created`
  → Vérifier que l'email Stripe correspond à un `profiles.email` existant
  → Mettre à jour `profiles.plan = 'pro'`
  → Ajouter `profiles.stripe_customer_id = stripe_customer_id`
  → Ajouter `profiles.stripe_subscription_id = stripe_subscription_id`
  → Ajouter `profiles.stripe_subscription_status = 'active'`
```

### Étape 2 — Période de transition (incohérence possible)

Pendant ~30 secondes entre le paiement Stripe et le webhook :
- `profiles.plan` est encore `'free'` — l'utilisateur voit les limitations
- **Solution** : utiliser un polling côté client ou une expiration courte de cache (pas de cache sur `plan`)

### Étape 3 — Webhooks critiques

| Webhook | Action |
|---|---|
| `customer.subscription.created` | `plan = 'pro'`, `stripe_subscription_status = 'active'` |
| `customer.subscription.updated` | Vérifier `status` ; si `past_due` → laisser pro mais log |
| `customer.subscription.deleted` | `plan = 'free'` (fin de période) |
| `invoice.payment_failed` | Log, email de relance, pas de downgrade immédiat |

### Étape 4 — Downgrade

Ne pas downgrade instantanément à l'échec de paiement. Stripe donne ~14 jours de grâce.
Règle : si `stripe_subscription_status = 'past_due'` pendant plus de 7 jours, alors `plan = 'free'`.

### Checklist colonnes Stripe à ajouter

```sql
ALTER TABLE profiles ADD COLUMN stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN stripe_subscription_status text DEFAULT 'inactive';
CREATE UNIQUE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
```

### Anti-patterns à éviter

- ❌ Lire le statut Stripe à chaque requête (lent, coûteux)
- ✅ Lire `profiles.plan` (rapide, RLS friendly)
- ❌ Écrire `plan` depuis le frontend
- ✅ Écrire `plan` uniquement depuis les webhooks Stripe ou Supabase Dashboard
- ❌ Faire confiance à un flag `is_active` sans vérifier la date d'expiration
- ✅ Utiliser `stripe_subscription_status` comme filet de sécurité

## Architecture cible (avec Stripe)

```
Stripe Checkout → success_url → /dashboard (plan encore free)
                              → webhook Stripe → UPDATE profiles SET plan = 'pro'
                              → client refetch auth-context → plan = 'pro'
```

Le rafraîchissement côté client se fait via :
```tsx
// auth-context.tsx — après signIn ou retour de page
const { data } = await supabase
  .from('profiles')
  .select('plan')
  .eq('id', user.id)
  .single();
setPlan(data?.plan ?? 'free');
```

Pas de cache, pas de stale-while-revalidate — la latence <1s est acceptable.
