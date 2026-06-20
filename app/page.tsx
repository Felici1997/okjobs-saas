'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { IconArrowRight, IconBolt, IconUsers, IconBrain, IconMessage, IconChartBar, IconPlayerPlay, IconStar, IconChecks, IconCertificate, IconTrophy, IconBulb, IconGrowth } from '@tabler/icons-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

const IMG_PLATFORM = 'https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/Plateforme_apercu.png';
const IMG_ELECTRICIAN = 'https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/AI%20generated%20Skilled%20Male%20Electrician%20Fixing%20Wiring,%20AI%20Generated.jpg';
const IMG_FAITHFUL = 'https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/Faithful,%20Fearing%20God.jpg';
const IMG_STUDENTS = 'https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/Two%20university%20students.jpg';

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return <div ref={ref} className="fade-in">{children}</div>;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: '#009fe1' }}>{value}</p>
      <p className="mt-1 text-sm text-black/50">{label}</p>
    </div>
  );
}

function TestimonialQuote({ text, name, role }: { text: string; name: string; role: string }) {
  return (
    <div className="p-8 bg-white border border-black/5 h-full flex flex-col justify-between">
      <p className="text-sm leading-relaxed text-black/70 mb-6">&ldquo;{text}&rdquo;</p>
      <div className="border-t border-black/5 pt-4">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-black/40 mt-0.5">{role}</p>
      </div>
    </div>
  );
}

const stats = [
  { value: '10k+', label: 'Candidats entraînés' },
  { value: '70%', label: "Taux d'entretien réussi" },
  { value: '3x', label: 'Plus de confiance' },
  { value: '98%', label: 'Satisfaction' },
];

const modules = [
  {
    icon: IconBrain,
    title: 'Tests d\'intelligence',
    desc: 'QCM générés par IA pour évaluer votre raisonnement logique, mathématique, verbal et spatial.',
    stat: '4 catégories',
    color: '#009fe1',
    href: '/tests',
  },
  {
    icon: IconChartBar,
    title: 'Bilan de compétences',
    desc: '25 questions sur 5 axes (Communication, Leadership, Problèmes, Équipe, Adaptabilité) pour cartographier vos forces.',
    stat: '5 compétences',
    color: '#7C3AED',
    href: '/bilan',
  },
  {
    icon: IconStar,
    title: 'Test de personnalité',
    desc: 'Modèle Big Five (OCEAN) — 30 affirmations pour découvrir vos traits et les environnements qui vous correspondent.',
    stat: '5 traits',
    color: '#059669',
    href: '/personnalite',
  },
  {
    icon: IconMessage,
    title: 'Entretien simulé',
    desc: 'Questions techniques, comportementales et motivationnelles adaptées à votre CV et au poste visé.',
    stat: '3 types',
    color: '#D97706',
    href: '/interview',
  },
];

const features = [
  {
    title: 'Évaluez votre profil complet',
    desc: "Tests cognitifs, bilan de compétences, personnalité et entretien simulé : une photo à 360° de votre employabilité. L'IA analyse chaque résultat pour vous connaître mieux que vous-même.",
    stat: { value: '4', label: 'Modules complémentaires' },
  },
  {
    title: 'Des recommandations sur mesure',
    desc: "À partir de vos résultats, l'IA identifie vos axes de progression et vous suggère des formations adaptées parmi notre catalogue de programmes partenaires.",
    stat: { value: '200+', label: 'Programmes de formation' },
  },
  {
    title: 'Suivez votre progression',
    desc: 'Chaque module garde l\'historique de vos sessions. Visualisez l\'évolution de vos scores, comparez vos résultats et mesurez vos progrès dans le temps.',
    stat: { value: 'Historique', label: 'Complet' },
  },
  {
    title: 'Certifiez vos acquis',
    desc: 'Partagez vos résultats de bilan et de personnalité avec les recruteurs. Faites la différence en montrant une connaissance approfondie de votre profil professionnel.',
    stat: { value: 'Export', label: 'Rapports PDF' },
  },
];

const testimonials = [
  {
    text: "Le bilan de compétences m'a vraiment ouvert les yeux sur mes points forts. Les recommandations de formation étaient parfaitement adaptées.",
    name: 'Sophie Martin',
    role: 'Développeuse Full Stack',
  },
  {
    text: "Tests, personnalité, entretien... Tout est connecté. J'ai pu préparer ma recherche d'emploi de A à Z avec une seule plateforme.",
    name: 'Thomas Dubois',
    role: 'Chef de produit',
  },
  {
    text: "Le test de personnalité Big Five est incroyablement précis. Ça m'a aidé à cibler les entreprises dont la culture me correspond.",
    name: 'Léa Petit',
    role: 'Consultante',
  },
];

const steps = [
  { num: '01', title: 'Créez votre profil', desc: 'Inscrivez-vous gratuitement en 30 secondes.' },
  { num: '02', title: 'Évaluez-vous', desc: 'Passez les modules dans l\'ordre de votre choix : tests, bilan, personnalité.' },
  { num: '03', title: 'Analysez vos résultats', desc: "Recevez des rapports détaillés et des recommandations de formation." },
  { num: '04', title: 'Entraînez-vous', desc: "Simulez des entretiens réels avec l'IA et améliorez vos performances." },
  { num: '05', title: 'Décrochez le poste', desc: 'Postulez avec confiance, fort de votre préparation complète.' },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ===== HERO ===== */}
        <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 hero-grid-bg" />
          <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/[0.03] border border-black/5 text-xs font-semibold tracking-wider text-black/50 mb-8">
                  <IconBolt className="w-3.5" style={{ color: '#009fe1' }} />
                  4 outils IA pour votre carrière
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.9]">
                  Préparez-vous<br />
                  <span style={{ color: '#009fe1' }}>de A à Z.</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-black/50 max-w-lg leading-relaxed">
                  Tests cognitifs, bilan de compétences, personnalité et entretien simulé.
                  Une plateforme complète pour maîtriser chaque étape de votre recherche d&apos;emploi.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-3 px-8 py-4 text-white text-sm font-semibold tracking-wide transition-colors"
                    style={{ background: '#009fe1' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#0088cc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#009fe1'; }}
                  >
                    Commencer gratuitement
                    <IconArrowRight className="w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 border border-black/10 text-sm font-medium tracking-wide hover:bg-black/[0.02] transition-colors"
                  >
                    Voir une démo
                    <IconPlayerPlay className="w-4" />
                  </Link>
                </div>
                <p className="mt-6 text-xs text-black/30 font-mono tracking-wider">
                  Accès gratuit à tous les modules &middot; Sans carte bancaire
                </p>
              </div>
              <div className="lg:col-span-6 hidden lg:flex justify-center">
                <img src={IMG_PLATFORM} alt="Aperçu de la plateforme Okjobs" className="w-full max-w-lg rounded-lg shadow-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* ===== MODULES ===== */}
        <section id="modules" className="border-t border-black/5 bg-black/[0.02]">
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <FadeInSection>
              <p className="text-xs font-mono font-semibold tracking-wider text-center mb-4" style={{ color: '#009fe1' }}>MODULES</p>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center leading-[1.05]">
                Tout ce dont vous avez besoin<br />
                <span style={{ color: '#009fe1' }}>pour réussir vos entretiens</span>
              </h2>
            </FadeInSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {modules.map((m) => {
                const Icon = m.icon;
                return (
                  <FadeInSection key={m.title}>
                    <Link href={m.href} className="block group h-full">
                      <div className="p-8 bg-white border border-black/5 h-full hover:shadow-lg transition-shadow duration-300">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ background: `${m.color}15` }}>
                          <Icon className="w-6" style={{ color: m.color }} />
                        </div>
                        <h3 className="text-base font-semibold mb-3">{m.title}</h3>
                        <p className="text-sm text-black/50 leading-relaxed mb-6">{m.desc}</p>
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider" style={{ color: m.color }}>
                          <span>{m.stat}</span>
                          <IconArrowRight className="w-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </FadeInSection>
                );
              })}
            </div>
            <FadeInSection>
              <div className="mt-10 p-8 bg-white border border-black/5 text-center">
                <IconGrowth className="w-8 mx-auto mb-4" style={{ color: '#009fe1' }} />
                <h3 className="text-lg font-semibold mb-2">Recommandations de formation personnalisées</h3>
                <p className="text-sm text-black/50 max-w-xl mx-auto">
                  En combinant vos résultats aux 4 modules, notre IA vous suggère les formations les plus adaptées
                  à votre profil parmi +200 programmes partenaires.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="border-t border-black/5">
          <div className="max-w-4xl mx-auto px-6 py-20 md:py-28">
            <FadeInSection>
              <p className="text-xs font-mono font-semibold tracking-wider text-center mb-4" style={{ color: '#009fe1' }}>PARCOURS</p>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center leading-[1.05]">
                Votre parcours en 5 étapes
              </h2>
            </FadeInSection>
            <div className="mt-16 space-y-8">
              {steps.map((s, i) => (
                <FadeInSection key={s.num} delay={i * 60}>
                  <div className="flex items-start gap-6 group">
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center text-sm font-bold tracking-wider text-white" style={{ background: '#009fe1' }}>
                      {s.num}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                      <p className="text-sm text-black/50">{s.desc}</p>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIAL QUOTE ===== */}
        <section className="border-t border-black/5 bg-black/[0.02]">
          <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
            <p className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-[1.2] text-black/80 text-center max-w-4xl mx-auto">
              &ldquo;J&apos;ai testé des tonnes d&apos;outils de préparation. Rien ne vaut la personnalisation d&apos;Okjobs. L&apos;IA adapte chaque question à mon profil et mon secteur.&rdquo;
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-black/5 flex items-center justify-center text-sm font-semibold" style={{ color: '#009fe1' }}>SM</div>
              <div>
                <p className="text-sm font-semibold">Sophie Martin</p>
                <p className="text-xs text-black/40">Développeuse Full Stack</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="border-t border-black/5">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {stats.map((s) => (
                <FadeInSection key={s.label}>
                  <Stat {...s} />
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section id="features" className="border-t border-black/5 bg-black/[0.02]">
          {features.map((f, i) => (
            <div key={f.title} className={`${i % 2 === 0 ? '' : 'bg-white'} border-b border-black/5`}>
              <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
                <div className={`flex flex-col md:flex-row gap-16 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                  <FadeInSection delay={i * 50}><div className="flex-1">
                    <img src={i % 2 === 0 ? IMG_STUDENTS : IMG_ELECTRICIAN} alt="" className="w-full rounded-lg shadow-lg" />
                  </div></FadeInSection>
                  <FadeInSection delay={i * 50}><div className="flex-1">
                    <p className="text-xs font-mono font-semibold tracking-wider mb-4" style={{ color: '#009fe1' }}>0{i + 1}</p>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1] mb-6">{f.title}</h2>
                    <p className="text-base text-black/50 leading-relaxed mb-8">{f.desc}</p>
                    <div className="inline-flex items-center gap-3 px-5 py-3 bg-black/[0.02] border border-black/5">
                      <span className="text-2xl font-bold" style={{ color: '#009fe1' }}>{f.stat.value}</span>
                      <span className="text-sm text-black/50">{f.stat.label}</span>
                    </div>
                  </div></FadeInSection>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="border-t border-black/5">
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <FadeInSection>
              <p className="text-xs font-mono font-semibold tracking-wider text-center mb-4" style={{ color: '#009fe1' }}>TÉMOIGNAGES</p>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center leading-[1.05]">
                Ne nous croyez pas sur parole
              </h2>
            </FadeInSection>
            <div className="grid md:grid-cols-3 gap-px bg-black/10 mt-16">
              {testimonials.map((t) => (
                <FadeInSection key={t.name}>
                  <TestimonialQuote {...t} />
                </FadeInSection>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: '#009fe1' }}
              >
                Rejoignez +10 000 candidats
                <IconArrowRight className="w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ===== RECRUITERS SECTION ===== */}
        <section className="border-t border-black/5 bg-black/[0.02]">
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5">
                <FadeInSection>
                  <p className="text-xs font-mono font-semibold tracking-wider mb-4" style={{ color: '#009fe1' }}>POUR LES RECRUTEURS</p>
                  <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                    Évaluez vos candidats<br />
                    <span style={{ color: '#009fe1' }}>sur tous les plans</span>
                  </h2>
                  <p className="mt-6 text-base text-black/50 leading-relaxed">
                    Proposez à vos candidats un parcours complet : tests cognitifs, bilan de compétences,
                    personnalité et entretien. Recevez des rapports détaillés sur chaque candidat.
                  </p>
                  <div className="mt-8">
                    <Link
                      href="/register"
                      className="group inline-flex items-center gap-3 px-6 py-3 text-white text-sm font-semibold tracking-wide transition-colors"
                      style={{ background: '#009fe1' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#0088cc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#009fe1'; }}
                    >
                      Essayer gratuitement
                      <IconArrowRight className="w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </FadeInSection>
              </div>
              <div className="lg:col-span-7">
                <div className="grid sm:grid-cols-2 gap-px bg-black/10">
                  {[
                    { icon: IconBrain, title: 'Tests cognitifs', desc: 'Évaluez le raisonnement logique, mathématique et verbal.' },
                    { icon: IconCertificate, title: 'Bilan de compétences', desc: 'Cartographie précise des soft skills de chaque candidat.' },
                    { icon: IconStar, title: 'Profil de personnalité', desc: "Comprenez les traits Big Five et l'adéquation culturelle." },
                    { icon: IconTrophy, title: 'Rapports consolidés', desc: 'Synthèse multiaxial avec recommandations de formation.' },
                  ].map((rf) => {
                    const Icon = rf.icon;
                    return (
                      <FadeInSection key={rf.title}>
                        <div className="p-8 bg-white h-full hover-lift">
                          <Icon className="w-6 mb-4" style={{ color: '#009fe1' }} />
                          <h3 className="text-base font-semibold mb-2">{rf.title}</h3>
                          <p className="text-sm text-black/50 leading-relaxed">{rf.desc}</p>
                        </div>
                      </FadeInSection>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== VISUAL BREAK ===== */}
        <section className="h-64 md:h-80 overflow-hidden border-t border-black/5">
          <img src={IMG_FAITHFUL} alt="" className="w-full h-full object-cover" loading="lazy" />
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="relative overflow-hidden border-t border-black/5" style={{ background: '#009fe1' }}>
          <div className="absolute inset-0 hero-grid-bg" style={{ opacity: 0.08 }} />
          <div className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center relative z-10">
            <FadeInSection>
              <p className="text-xs font-mono font-semibold tracking-wider text-white/60 mb-4">COMMENCER</p>
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-white">
                Prêt à passer à<br />
                la vitesse supérieure ?
              </h2>
              <p className="mt-6 text-base text-white/60 max-w-md mx-auto leading-relaxed">
                Accès gratuit à tous les modules. Pas de carte bancaire. Rejoignez les candidats
                qui préparent leur avenir avec Okjobs.
              </p>
              <div className="mt-10">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-sm font-bold tracking-wide hover:bg-white/90 transition-colors"
                  style={{ color: '#009fe1' }}
                >
                  Créer mon compte gratuit
                  <IconArrowRight className="w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeInSection>
          </div>
        </section>
      </main>

      <div className="sticky-cta-mobile">
        <Link
          href="/register"
          className="flex items-center justify-center gap-3 px-6 py-4 text-white font-semibold tracking-wide transition-colors"
          style={{ background: '#009fe1' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0088cc'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#009fe1'; }}
        >
          Essayer gratuitement
          <IconArrowRight className="w-4" />
        </Link>
      </div>

      <Footer />
    </>
  );
}
