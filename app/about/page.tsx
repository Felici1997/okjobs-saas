'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Target, Lightbulb, Users } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Notre mission',
    desc: 'Démocratiser la préparation aux entretiens d\'embauche grâce à l\'intelligence artificielle. Nous croyons que chacun mérite une chance égale de réussir ses entretiens.',
  },
  {
    icon: Lightbulb,
    title: 'Notre approche',
    desc: 'Utiliser les modèles d\'IA les plus avancés (Gemma 4 31B) pour simuler des entretiens réalistes et fournir des feedbacks constructifs et personnalisés.',
  },
  {
    icon: Users,
    title: 'Notre équipe',
    desc: 'Une équipe passionnée par l\'IA et l\'éducation, déterminée à aider les candidats à donner le meilleur d\'eux-mêmes lors de leurs entretiens.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold">À propos d&apos;Okjobs</h1>
            <p className="mt-4 text-lg text-base-content/60">
              La plateforme d&apos;entraînement aux entretiens d&apos;embauche propulsée par l&apos;IA.
            </p>
          </div>
        </section>

        <section className="py-16 bg-base-200/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v) => (
                <div key={v.title} className="card bg-base-100 shadow-sm">
                  <div className="card-body items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <v.icon className="w-7 text-primary" />
                    </div>
                    <h2 className="card-title">{v.title}</h2>
                    <p className="text-sm text-base-content/60 mt-2">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold">Pourquoi Okjobs ?</h2>
            <p className="mt-6 text-base-content/60 leading-relaxed max-w-2xl mx-auto">
              Okjobs est né d&apos;un constat simple : les entretiens d&apos;embauche sont stressants et
              la préparation est souvent insuffisante. En combinant l&apos;IA générative avec une
              interface simple et intuitive, nous offrons aux candidats un outil puissant pour
              s&apos;entraîner en conditions réelles, à leur rythme, sans jugement.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
