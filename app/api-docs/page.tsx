'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Key, Code, BookOpen, ArrowRight } from 'lucide-react';

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/health',
    desc: 'Vérifier le statut de l\'API',
    auth: false,
  },
  {
    method: 'GET',
    path: '/api/v1/profile',
    desc: 'Récupérer votre profil',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/cv',
    desc: 'Lister vos CV',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/cv/:id',
    desc: 'Récupérer un CV par son ID',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/interviews',
    desc: 'Lister vos entretiens',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/v1/interviews',
    desc: 'Créer un nouvel entretien',
    auth: true,
    body: '{ "jobTitle": "...", "sector": "...", "interviewType": "...", "difficulty": "...", "nbQuestions": 5, "timerMinutes": 0 }',
  },
  {
    method: 'GET',
    path: '/api/v1/interviews/:id',
    desc: 'Récupérer un entretien',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/interviews/:id/messages',
    desc: 'Récupérer les messages d\'un entretien',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/interviews/:id/feedback',
    desc: 'Récupérer le feedback d\'un entretien',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/v1/interviews/:id/chat',
    desc: 'Envoyer un message dans un entretien',
    auth: true,
    body: '{ "message": "..." }',
  },
  {
    method: 'POST',
    path: '/api/v1/interviews/:id/end',
    desc: 'Terminer un entretien et générer le feedback',
    auth: true,
  },
];

export default function ApiDocsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <Code className="w-8 text-primary" />
              <h1 className="text-4xl font-bold">API Publique</h1>
            </div>
            <p className="text-base-content/60 mt-2 mb-8">
              Intégrez Okjobs dans vos outils RH et vos pipelines de recrutement.
            </p>

            <div className="card bg-base-100 shadow-sm mb-8">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2">
                  <Key className="w-5 text-primary" />
                  Authentification
                </h2>
                <p className="text-sm text-base-content/60 mt-2">
                  Tous les endpoints (sauf <code className="bg-base-300 px-1 rounded">/health</code>) nécessitent une clé API.
                  Générée dans les paramètres du tableau de bord.
                </p>
                <div className="bg-base-300 p-4 rounded-lg mt-3 font-mono text-sm">
                  <p><span className="text-primary">Authorization:</span> Bearer okj_votre_clé_ici</p>
                </div>
                <div className="bg-base-300 p-4 rounded-lg mt-2 font-mono text-sm">
                  <p><span className="text-primary">Content-Type:</span> application/json</p>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm mb-8">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2">
                  <BookOpen className="w-5 text-primary" />
                  Endpoints
                </h2>
                <div className="overflow-x-auto mt-4">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Méthode</th>
                        <th>Chemin</th>
                        <th>Description</th>
                        <th>Auth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoints.map((ep) => (
                        <tr key={ep.path + ep.method}>
                          <td>
                            <span className={`badge badge-sm ${ep.method === 'GET' ? 'badge-success' : 'badge-primary'}`}>
                              {ep.method}
                            </span>
                          </td>
                          <td className="font-mono text-sm">{ep.path}</td>
                          <td className="text-sm">{ep.desc}</td>
                          <td>{ep.auth ? <span className="text-xs text-warning">Bearer</span> : <span className="text-xs text-success">Non</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm mb-8">
              <div className="card-body">
                <h2 className="card-title">Exemples</h2>
                <div className="space-y-6 mt-4">
                  <div>
                    <h3 className="font-bold text-sm mb-2">Récupérer son profil</h3>
                    <pre className="bg-base-300 p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{`curl -H "Authorization: Bearer okj_ma_clé" \\
  https://okjobs.fr/api/v1/profile`}</code>
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-2">Créer un entretien</h3>
                    <pre className="bg-base-300 p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{`curl -X POST https://okjobs.fr/api/v1/interviews \\
  -H "Authorization: Bearer okj_ma_clé" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jobTitle": "Développeur Full Stack",
    "sector": "Tech",
    "interviewType": "technique",
    "difficulty": "intermediaire",
    "nbQuestions": 5
  }'`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title">Erreurs</h2>
                <p className="text-sm text-base-content/60 mt-2">
                  L&apos;API retourne des erreurs standardisées au format JSON :
                </p>
                <div className="bg-base-300 p-4 rounded-lg mt-3 font-mono text-sm">
                  <p>{'{'}</p>
                  <p className="ml-4"><span className="text-primary">&ldquo;error&rdquo;</span>: <span className="text-success">&ldquo;Description de l&apos;erreur&rdquo;</span></p>
                  <p>{'}'}</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="badge badge-sm">401</span> Clé API manquante ou invalide</p>
                  <p><span className="badge badge-sm">404</span> Ressource introuvable</p>
                  <p><span className="badge badge-sm">400</span> Données invalides</p>
                  <p><span className="badge badge-sm">502</span> Erreur du fournisseur IA</p>
                  <p><span className="badge badge-sm">429</span> Trop de requêtes (rate limit: 60/min)</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <a href="/settings" className="btn btn-primary">
                <Key className="w-4" />
                Générer une clé API
                <ArrowRight className="w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
