# Okjobs — Préparation d'entretiens IA

**Okjobs** est un SaaS de préparation d'entretiens d'embauche
assistée par intelligence artificielle. Créez votre CV, choisissez
un type d'entretien (technique, comportemental, motivationnel) et
entraînez-vous avec un recruteur IA qui analyse vos réponses en
temps réel.

## Fonctionnalités

- Entretiens IA : Technique, Comportemental, Motivationnel
- CV Builder persistant (création, import PDF, stockage Supabase)
- Minuteur intégré avec fin automatique stricte
- Feedback détaillé : score, forces, faiblesses, recommandations
- API publique REST pour intégrations tierces
- Plans : Gratuit (3 entretiens/mois) et Pro
- Dashboard avec historique, tendances, statistiques
- Landing page responsive

## Stack

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **UI** : Tailwind CSS + DaisyUI (thème corporate)
- **Typographie** : Plus Jakarta Sans
- **Auth** : Supabase Auth (email)
- **Base de données** : Supabase PostgreSQL (RLS, migrations)
- **Stockage** : Supabase Storage (CV, photos)
- **IA** : OpenRouter (gemma-4-31b-it, fallbacks)
- **Analytics** : PostHog Cloud
- **API** : REST publique (clés API SHA-256, rate limiting)
- **Tests** : Vitest

## Architecture

okjobs/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   │   ├── internal/
│   │   └── v1/
│   ├── components/
│   ├── landing/
│   └── page.tsx
├── lib/
│   ├── api/ — utils réponse API
│   ├── contexts/ — React contexts
│   ├── hooks/ — hooks personnalisés
│   ├── openrouter/ — client IA, prompts
│   ├── posthog/ — analytics serveur/client
│   ├── supabase/ — clients Supabase
│   ├── utils/ — rate-limit, cn
│   └── validations/ — schémas Zod
├── supabase/migrations/ — SQL migrations
├── types/
├── docs/
└── tests/
