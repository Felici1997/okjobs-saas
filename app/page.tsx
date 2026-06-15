'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { IconArrowRight, IconBolt, IconUsers, IconBrain, IconMessage, IconChartBar, IconPlayerPlay } from '@tabler/icons-react';
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

const features = [
  {
    title: "Le plus grand réseau d'entraîneurs IA",
    desc: "Notre IA a analysé des milliers d'entretiens réels. Chaque session est calibrée sur votre secteur, votre poste et votre niveau d'expérience.",
    stat: { value: '5 000+', label: 'Scénarios d\'entretien' },
  },
  {
    title: 'Une IA qui apprend à vous connaître',
    desc: "À chaque réponse, notre IA affine sa compréhension de votre profil. Elle adapte les questions pour vous pousser là où vous en avez besoin.",
    stat: { value: '85%', label: 'Questions personnalisées' },
  },
  {
    title: 'Des résultats en jours, pas en mois',
    desc: "3 à 5 sessions suffisent pour gagner en aisance. Nos utilisateurs décrochent un entretien réel en moyenne 2 semaines après leur première session.",
    stat: { value: '2 sem.', label: 'Pour décrocher un entretien' },
  },
  {
    title: 'Accompagnement dédié',
    desc: "Votre coach IA est disponible 24/7. Recevez des feedbacks détaillés après chaque réponse et suivez votre progression dans le temps.",
    stat: { value: '24/7', label: 'Disponible' },
  },
];

const testimonials = [
  {
    text: "Après trois entraînements sur Okjobs, j'étais parfaitement préparée. Le feedback m'a aidé à corriger mes points faibles avant l'entretien réel.",
    name: 'Sophie Martin',
    role: 'Développeuse Full Stack',
  },
  {
    text: "Le mode chronométré m'a permis d'être calibré le jour J. Je savais exactement combien de temps prendre pour chaque réponse.",
    name: 'Thomas Dubois',
    role: 'Chef de produit',
  },
  {
    text: "La personnalisation des questions est bluffante. On croirait vraiment parler à un recruteur qui connaît mon CV et mon secteur.",
    name: 'Léa Petit',
    role: 'Consultante',
  },
];

const recruiterFeatures = [
  { icon: IconBrain, title: 'IA pour vous préparer', desc: 'Notre IA génère des questions sur mesure à partir de votre CV et du poste visé.' },
  { icon: IconUsers, title: 'Coach personnel virtuel', desc: 'Un professeur particulier disponible à toute heure, sans rendez-vous.' },
  { icon: IconChartBar, title: 'Statistiques détaillées', desc: 'Suivez votre progression : scores, temps de réponse, domaines à améliorer.' },
  { icon: IconMessage, title: 'Feedback en temps réel', desc: 'Recevez une analyse de chaque réponse avec des conseils concrets.' },
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
                  L&apos;IA au service de votre carrière
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.9]">
                  Décrochez le poste<br />
                  <span style={{ color: '#009fe1' }}>sans stresser l&apos;entretien.</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-black/50 max-w-lg leading-relaxed">
                  Des milliers de candidats utilisent notre IA pour se préparer aux entretiens.
                  Simulations réalistes, feedback instantané, progression garantie.
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
                  3 entretiens gratuits par mois &middot; Sans carte bancaire
                </p>
              </div>
              <div className="lg:col-span-6 hidden lg:flex justify-center">
                <img src={IMG_PLATFORM} alt="Aperçu de la plateforme Okjobs" className="w-full max-w-lg rounded-lg shadow-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIAL QUOTE ===== */}
        <section className="border-t border-black/5">
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
        <section className="border-t border-black/5 bg-black/[0.02]">
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

        {/* ===== FEATURES (stacked) ===== */}
        <section id="features" className="border-t border-black/5">
          {features.map((f, i) => (
            <div key={f.title} className={`${i % 2 === 0 ? '' : 'bg-black/[0.02]'} border-b border-black/5`}>
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
        <section className="border-t border-black/5 bg-black/[0.02]">
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
                Lire plus d&apos;histoires
                <IconArrowRight className="w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ===== RECRUITERS SECTION (secondary) ===== */}
        <section className="border-t border-black/5">
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5">
                <FadeInSection>
                  <p className="text-xs font-mono font-semibold tracking-wider mb-4" style={{ color: '#009fe1' }}>POUR LES RECRUTEURS</p>
                  <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                    Le moyen le plus rapide<br />
                    <span style={{ color: '#009fe1' }}>d&apos;évaluer vos candidats</span>
                  </h2>
                  <p className="mt-6 text-base text-black/50 leading-relaxed">
                    Proposez des entretiens techniques, comportementaux et motivationnels à vos candidats.
                    Recevez des rapports détaillés sur leurs performances.
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
                  {recruiterFeatures.map((rf) => {
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
                Le meilleur moment<br />
                c&apos;était hier.
              </h2>
              <p className="mt-6 text-base text-white/60 max-w-md mx-auto leading-relaxed">
                14 jours d&apos;essai gratuit, sans carte bancaire. Rejoignez les candidats qui préparent leurs entretiens avec Okjobs.
              </p>
              <div className="mt-10">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-sm font-bold tracking-wide hover:bg-white/90 transition-colors"
                  style={{ color: '#009fe1' }}
                >
                  Commencer mon essai gratuit
                  <IconArrowRight className="w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeInSection>
          </div>
        </section>

      </main>

      {/* Sticky CTA mobile */}
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
