'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import AnimatedCounter from '@/app/components/AnimatedCounter';
import { useHeroSimulation } from '@/lib/hooks/useHeroSimulation';

function FadeInSection({ children, delay = 0, scale = false }: { children: React.ReactNode; delay?: number; scale?: boolean }) {
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
  return <div ref={ref} className={scale ? 'fade-in-scale' : 'fade-in'}>{children}</div>;
}

function StaggerTitle({ text, highlight }: { text: string; highlight: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll('.stagger-title');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          spans.forEach((s, i) => {
            setTimeout(() => s.classList.add('visible'), i * 60);
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(' ');
  return (
    <h1 ref={ref} className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.9]">
      {words.map((w, i) => (
        <span key={i} className="stagger-title inline-block mr-3">{w}</span>
      ))}
      <br />
      <span className="signal stagger-title inline-block">{highlight}</span>
    </h1>
  );
}

function SimulationCard() {
  const { typedText, isTyping, displayTime, timerColor, progress, isComplete } = useHeroSimulation();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef} className="hero-card-enter bg-white border border-black/5 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'rgba(0,159,225,0.1)', color: '#009fe1' }}>IA</div>
        <div>
          <p className="text-sm font-semibold">Recruteur · Technique</p>
          <p className="text-xs text-black/40 font-mono">Question 3/5</p>
        </div>
      </div>
      <div className="pl-4 mb-6 min-h-[4rem]">
        <p className={`text-sm leading-relaxed text-black/80 ${isTyping ? 'typing-cursor' : ''}`}>
          &ldquo;{typedText}&rdquo;
        </p>
      </div>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-px bg-black/10">
            <div
              className="h-full progress-fill"
              style={{
                background: 'rgba(0,159,225,0.6)',
                width: i === 2 ? `${isComplete ? Math.min(100, progress) : 0}%` : i === 0 ? '100%' : (isComplete ? `${Math.min(100, progress)}%` : '0%'),
                transitionDuration: i === 1 ? '0.3s' : '0.3s',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs font-mono">
        <span className="signal">Progression</span>
        <span className={timerColor}>{isComplete ? displayTime : '--:--'}</span>
      </div>
    </div>
  );
}

const features = [
  {
    number: '01', title: 'Trois modes d\'entretien',
    desc: 'Technique, comportemental, motivationnel. Chaque mode utilise un prompt IA spécialisé qui pose des questions adaptées à votre profil et au poste visé.',
  },
  {
    number: '02', title: 'Feedback après chaque réponse',
    desc: 'L\'IA analyse votre réponse en temps réel. En fin d\'entretien, un rapport détaille vos forces, vos axes d\'amélioration et une note globale.',
  },
  {
    number: '03', title: 'Timer paramétrable',
    desc: 'De 5 à 60 minutes. L\'entretien s\'arrête automatiquement quand le temps est écoulé — comme en conditions réelles.',
  },
  {
    number: '04', title: 'CV importé ou créé sur place',
    desc: 'Importez votre CV au format PDF ou saisissez vos informations directement. L\'IA s\'en sert pour personnaliser chaque question.',
  },
];

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main>

        {/* ===== HERO ===== */}
        <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 hero-grid-bg" />
          <div className="max-w-7xl mx-auto px-8 w-full">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <StaggerTitle text="Décrochez le poste" highlight="sans stresser l'entretien." />
                <p className="mt-6 text-lg md:text-xl text-black/60 max-w-lg leading-relaxed">
                  Entraînez-vous avec une IA qui pose les vraies questions, en conditions réelles avec timer.
                  Recevez un feedback après chaque réponse. Arrivez prêt le jour J.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-3 px-8 py-4 text-white text-sm font-semibold tracking-wide transition-colors active:scale-[0.97]" style={{ background: '#009fe1' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#0088cc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#009fe1'; }}
                  >
                    Essayer gratuitement
                    <IconArrowRight className="w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/#features"
                    className="inline-flex items-center gap-2 px-8 py-4 border border-black/10 text-sm font-medium tracking-wide hover:bg-black/[0.02] transition-colors"
                  >
                    Voir les fonctionnalités
                  </Link>
                </div>
                <p className="mt-6 text-xs signal font-mono tracking-wider">
                  3 entretiens gratuits par mois · Sans carte bancaire
                </p>
              </div>
              <div className="lg:col-span-5 hidden lg:block">
                <SimulationCard />
              </div>
            </div>
          </div>
        </section>

        {/* ===== SOCIAL PROOF ===== */}
        <section className="bg-black/[0.02] border-t border-black/5">
          <div className="max-w-5xl mx-auto px-8 py-8">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm">
              <span className="signal font-semibold text-lg">+500</span>
              <span className="text-black/30 hidden sm:inline">·</span>
              <span className="text-black/60 font-medium">candidats entraînés</span>
              <span className="text-black/30 hidden sm:inline">·</span>
              <span className="text-black/60 font-medium">Note 4.8/5</span>
              <span className="text-black/30 hidden sm:inline">·</span>
              <span className="text-sm font-mono signal tracking-wider">Sans carte bancaire</span>
            </div>
          </div>
        </section>

        {/* ===== PROBLEM ===== */}
        <section className="py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeInSection>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-lg leading-[1.05]">
                  Vous stressez à l&apos;idée<br />
                  <span className="signal">de l&apos;entretien ?</span>
                </h2>
              </FadeInSection>
              <FadeInSection>
                  <div className="space-y-4">
                    <div className="p-6 bg-black/[0.02] border border-black/5 hover-lift">
                      <p className="font-semibold mb-1">Questions génériques</p>
                      <p className="text-sm text-black/50 leading-relaxed">Les recruteurs ne posent pas les mêmes questions que les simulateurs basiques. Vous arrivez démuni.</p>
                    </div>
                    <div className="p-6 bg-black/[0.02] border border-black/5 hover-lift">
                      <p className="font-semibold mb-1">Pas de vrai feedback</p>
                      <p className="text-sm text-black/50 leading-relaxed">Vous répondez, mais personne ne vous dit ce qui cloche. Impossible de progresser sans retour.</p>
                    </div>
                    <div className="p-6 bg-black/[0.02] border border-black/5 hover-lift">
                      <p className="font-semibold mb-1">Le stress du chrono</p>
                      <p className="text-sm text-black/50 leading-relaxed">En entretien réel, le temps file. Sans entraînement au timer, vous perdez vos moyens.</p>
                    </div>
                  </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section id="features" className="py-24 md:py-32 bg-black/[0.02]">
          <div className="max-w-5xl mx-auto px-8">
            <FadeInSection>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl leading-[1.05]">
                Pas de questions génériques.<br />
                <span className="signal">Des questions pour vous.</span>
              </h2>
            </FadeInSection>
            <div className="grid md:grid-cols-2 gap-px bg-black/10 mt-16">
              {features.map((f, i) => (
                <FadeInSection key={f.number} delay={i * 80}>
                  <div className="p-8 bg-white h-full hover-lift">
                    <p className="text-xs font-mono signal font-semibold mb-4">{f.number}</p>
                    <h3 className="text-lg font-semibold mb-3">{f.title}</h3>
                    <p className="text-sm text-black/50 leading-relaxed">{f.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how-it-works" className="py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-8">
            <FadeInSection>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                Trois minutes.<br />
                <span className="signal">Trois étapes.</span>
              </h2>
            </FadeInSection>
            <div className="grid md:grid-cols-3 gap-12 md:gap-16 mt-16">
              {[
                { n: '01', t: 'Inscription', d: 'Créez votre compte en 30 secondes. Aucune carte bancaire.' },
                { n: '02', t: 'Votre profil', d: 'Importez votre CV ou renseignez votre secteur. L\'IA adapte les questions.' },
                { n: '03', t: 'Entraînement', d: 'Répondez, recevez du feedback, recommencez. Vous progressez à chaque session.' },
              ].map((step, i) => (
                <FadeInSection key={step.n} delay={i * 100}>
                  <div>
                    <p className="text-5xl md:text-6xl font-bold text-black/5 mb-4 select-none leading-none">
                      <AnimatedCounter to={parseInt(step.n)} />
                    </p>
                    <h3 className="text-xl font-semibold mb-2">{step.t}</h3>
                    <p className="text-sm text-black/50 leading-relaxed">{step.d}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="py-24 md:py-32 bg-black/[0.02]">
          <div className="max-w-5xl mx-auto px-8">
            <FadeInSection>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                Ils ont préparé<br />
                <span className="signal">et décroché.</span>
              </h2>
            </FadeInSection>
            <div className="grid md:grid-cols-3 gap-px bg-black/10 mt-16">
              {[
                {
                  text: 'Après trois entraînements, j\'étais parfaitement préparée. Le feedback m\'a aidé à corriger mes points faibles avant l\'entretien réel.',
                  name: 'Sophie Martin', role: 'Développeuse Full Stack',
                },
                {
                  text: 'Le timer m\'a permis d\'être calibré le jour J. Je savais exactement combien de temps prendre pour chaque réponse. Un vrai game changer.',
                  name: 'Thomas Dubois', role: 'Chef de produit',
                },
                {
                  text: 'L\'entretien comportemental est d\'un réalisme bluffant. Les questions STAR m\'ont préparée aux méthodes des grands cabinets.',
                  name: 'Léa Petit', role: 'Consultante',
                },
              ].map((t) => (
                <FadeInSection key={t.name}>
                  <div className="p-8 bg-white h-full border-b md:border-b-0 border-black/5 hover-lift">
                    <p className="text-sm leading-relaxed text-black/70 mb-6">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="border-t border-black/5 pt-4">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs font-mono text-black/40 mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section id="pricing" className="py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-8">
            <FadeInSection>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                Gratuit pour commencer.<br />
                <span className="signal">Pro pour aller loin.</span>
              </h2>
            </FadeInSection>
            <div className="grid md:grid-cols-3 gap-px bg-black/10 mt-16">
              {[
                {
                  name: 'Gratuit', price: '0 FCFA', tag: 'Pour découvrir',
                  items: ['3 entretiens/mois', 'CV intégré', '1 mode d\'entretien', 'Feedback basique'],
                  cta: 'Créer un compte', href: '/register',
                },
                {
                  name: 'Pro', price: '2 500 FCFA / AN', tag: 'Recommandé',
                  items: ['Entretiens illimités', 'Questions personnalisées avancées', 'Feedback détaillé', 'Import PDF', 'Statistiques', 'Support prioritaire'],
                  cta: 'Essayer 7 jours', href: '/register', featured: true,
                },
                {
                  name: 'Enterprise', price: 'Sur mesure', tag: 'Pour les équipes',
                  items: ['Tout le Pro', 'API dédiée', 'Dashboard admin', 'Comptes en lot', 'Support téléphonique'],
                  cta: 'Nous contacter', href: '/contact',
                },
              ].map((p) => (
                <FadeInSection key={p.name}>
                  <div className={`p-8 bg-white h-full flex flex-col hover-lift ${p.featured ? 'border-2 signal-border shadow-sm' : 'border-b md:border-b-0 border-black/5'}`}>
                    <div>
                      <p className="text-xs font-mono text-black/40 tracking-wider uppercase mb-1">{p.tag}</p>
                      <p className="text-xl font-semibold mb-1">{p.name}</p>
                      <p className="text-3xl font-semibold mb-8">{p.price}</p>
                      <ul className="space-y-3 mb-10">
                        {p.items.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm text-black/60">
                            <IconCheck className="w-3.5 mt-0.5 shrink-0 signal" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto">
                      <Link
                        href={p.href}
                        className={`block text-center py-3 text-sm font-medium tracking-wide transition-colors ${p.featured ? 'text-white' : 'border border-black/10 hover:bg-black/[0.02]'}`}
                        style={p.featured ? { background: '#009fe1' } : {}}
                        onMouseEnter={(e) => { if (p.featured) e.currentTarget.style.background = '#0088cc'; }}
                        onMouseLeave={(e) => { if (p.featured) e.currentTarget.style.background = '#009fe1'; }}
                      >
                        {p.cta}
                      </Link>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="py-24 md:py-32 bg-black/[0.02]">
          <div className="max-w-3xl mx-auto px-8">
            <FadeInSection>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                Questions fréquentes
              </h2>
            </FadeInSection>
            <div className="mt-16 space-y-px bg-black/10">
              {[
                { q: 'C\'est vraiment gratuit ?', r: 'Oui. 3 entretiens complets par mois, sans limite de durée. Pas de carte bancaire.' },
                { q: 'L\'IA connaît-elle mon secteur ?', r: 'Vous indiquez le poste et le secteur visés. Si vous importez votre CV, l\'IA l\'analyse pour des questions ultra-ciblées.' },
                { q: 'Puis-je choisir la durée ?', r: 'Oui. Pas de timer pour un entraînement tranquille, ou un timer de 5 à 60 minutes avec arrêt automatique.' },
                { q: 'Mes données sont-elles protégées ?', r: 'Chiffrement en transit, aucun partage. Vous pouvez supprimer vos données à tout moment depuis votre compte.' },
              ].map((f, i) => (
                <FadeInSection key={i}>
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className={`w-full flex items-center justify-between p-6 bg-white text-left transition-colors ${faqOpen === i ? 'bg-black/[0.01]' : 'hover:bg-black/[0.01]'}`}
                  >
                    <span className="text-sm font-medium">{f.q}</span>
                    <span className={`text-xs font-mono signal transition-transform ${faqOpen === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {faqOpen === i && (
                    <div className="px-6 pb-6 bg-white">
                      <p className="text-sm text-black/50 leading-relaxed">{f.r}</p>
                    </div>
                  )}
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="py-32 relative overflow-hidden" style={{ background: '#009fe1' }}>
          <div className="absolute inset-0 hero-grid-bg" style={{ opacity: 0.08 }} />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute h-px bg-white/20 top-1/4 left-1/4 animate-line-1" />
            <div className="absolute h-px bg-white/20 top-2/3 right-1/3 animate-line-2" />
            <div className="absolute h-px bg-white/20 bottom-1/4 left-1/3 animate-line-3" />
          </div>
          <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
            <FadeInSection scale>
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-white">
                Le meilleur moment<br />
                <span className="text-white">c&apos;était hier.</span>
              </h2>
              <p className="mt-6 text-sm text-white/60 max-w-md mx-auto leading-relaxed">
                14 jours d&apos;essai gratuit, sans carte bancaire. Rejoignez les candidats qui préparent leurs entretiens avec Okjobs.
              </p>
              <div className="mt-10">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-sm font-bold tracking-wide hover:bg-white/90 transition-colors active:scale-[0.97]"
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
          className="flex items-center justify-center gap-3 px-6 py-4 text-white font-semibold tracking-wide transition-colors" style={{ background: '#009fe1' }}
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
