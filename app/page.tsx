'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { IconArrowRight, IconBolt, IconUsers, IconBrain, IconMessage, IconChartBar, IconPlayerPlay, IconStar, IconCertificate, IconTrophy, IconBulb, IconChecks, IconEye, IconTarget, IconTrendingUp } from '@tabler/icons-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

const IMG_PLATFORM = 'https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/Plateforme_apercu.png';
const IMG_ELECTRICIAN = 'https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/AI%20generated%20Skilled%20Male%20Electrician%20Fixing%20Wiring,%20AI%20Generated.jpg';
const IMG_FAITHFUL = 'https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/Faithful,%20Fearing%20God.jpg';
const IMG_STUDENTS = 'https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/Two%20university%20students.jpg';

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, threshold = 0.15 }: { children: React.ReactNode; delay?: number; threshold?: number }) {
  const { ref, visible } = useScrollReveal(threshold);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const modules = [
  { icon: IconBrain, title: 'Tests d\'intelligence', desc: 'Raisonnement logique, mathématique, verbal et spatial.', color: '#009fe1', href: '/tests' },
  { icon: IconChartBar, title: 'Bilan de compétences', desc: '25 questions sur 5 axes pour cartographier vos forces.', color: '#7C3AED', href: '/bilan' },
  { icon: IconStar, title: 'Test de personnalité', desc: 'Modèle Big Five — 30 affirmations pour décoder vos traits.', color: '#059669', href: '/personnalite' },
  { icon: IconMessage, title: 'Entretien simulé', desc: 'Questions adaptées à votre CV et au poste visé.', color: '#D97706', href: '/interview' },
];

const testimonials = [
  {
    text: "Le bilan de compétences m'a vraiment ouvert les yeux sur mes points forts. Les recommandations de formation étaient parfaitement adaptées.",
    name: 'Sophie Martin', role: 'Développeuse Full Stack',
  },
  {
    text: "Tests, personnalité, entretien... Tout est connecté. J'ai pu préparer ma recherche de A à Z avec une seule plateforme.",
    name: 'Thomas Dubois', role: 'Chef de produit',
  },
  {
    text: "Le test de personnalité Big Five est incroyablement précis. Ça m'a aidé à cibler les entreprises dont la culture me correspond.",
    name: 'Léa Petit', role: 'Consultante',
  },
];

export default function LandingPage() {
  const [toolkitHover, setToolkitHover] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main>

        {/* ════════ HERO ════════ */}
        <section className="relative min-h-[90vh] flex items-center pt-28 pb-20 overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F8FAFC 100%)' }} />
          <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5">
                <FadeIn>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase" style={{ background: '#009fe1', color: '#fff', letterSpacing: '0.12em' }}>
                    <IconBolt className="w-3" />
                    Boîte à outils carrière
                  </div>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.88] mt-8" style={{ color: '#0F172A' }}>
                    Préparez-vous<br />
                    <span style={{ color: '#009fe1' }}>de A à Z.</span>
                  </h1>
                  <p className="mt-6 text-base md:text-lg leading-relaxed" style={{ color: '#475569', maxWidth: '420px' }}>
                    Tests cognitifs, bilan de compétences, personnalité Big Five et entretien simulé.
                    Une plateforme complète pour maîtriser chaque étape de votre recherche d&apos;emploi.
                  </p>
                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/register"
                      className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-white text-sm font-bold tracking-wide transition-all duration-200"
                      style={{ background: '#009fe1', borderRadius: '6px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#0088cc'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#009fe1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      Commencer gratuitement
                      <IconArrowRight className="w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium transition-all duration-200"
                      style={{ border: '1px solid #CBD5E1', borderRadius: '6px', color: '#334155' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <IconPlayerPlay className="w-4" />
                      Voir une démo
                    </Link>
                  </div>
                  <p className="mt-6 text-xs tracking-wider" style={{ color: '#94A3B8', letterSpacing: '0.08em' }}>
                    ACCÈS GRATUIT — SANS CARTE BANCAIRE
                  </p>
                </FadeIn>
              </div>

              {/* Toolkit visual — signature element */}
              <div className="lg:col-span-7">
                <FadeIn delay={150}>
                  <div className="relative max-w-lg mx-auto" style={{ minHeight: '400px' }}>
                    {/* Connecting lines */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                      <line x1="25%" y1="25%" x2="75%" y2="25%" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="25%" y1="75%" x2="75%" y2="75%" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="25%" y1="25%" x2="25%" y2="75%" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="75%" y1="25%" x2="75%" y2="75%" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="50%" y1="25%" x2="50%" y2="75%" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 3" />
                      <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 3" />
                    </svg>

                    <div className="grid grid-cols-2 gap-6 relative" style={{ zIndex: 1 }}>
                      {modules.map((m, i) => {
                        const Icon = m.icon;
                        const isHovered = toolkitHover === i;
                        return (
                          <Link
                            key={m.title}
                            href={m.href}
                            onMouseEnter={() => setToolkitHover(i)}
                            onMouseLeave={() => setToolkitHover(null)}
                            className="block"
                          >
                            <div
                              className="p-6 transition-all duration-300"
                              style={{
                                background: isHovered ? '#fff' : '#fff',
                                border: `1px solid ${isHovered ? m.color : '#E2E8F0'}`,
                                borderRadius: '8px',
                                boxShadow: isHovered ? `0 8px 24px ${m.color}15` : '0 1px 3px rgba(0,0,0,0.04)',
                                transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                              }}
                            >
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors"
                                style={{ background: isHovered ? m.color : `${m.color}10` }}
                              >
                                <Icon className="w-5 transition-colors" style={{ color: isHovered ? '#fff' : m.color }} />
                              </div>
                              <h3 className="text-sm font-bold mb-1" style={{ color: '#0F172A', letterSpacing: '-0.01em' }}>{m.title}</h3>
                              <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{m.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ STATS STRIP ════════ */}
        <section style={{ background: '#0F172A' }}>
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '10k+', label: 'Candidats entraînés' },
                { value: '70%', label: "Taux d'entretien réussi" },
                { value: '3x', label: 'Plus de confiance' },
                { value: '98%', label: 'Satisfaction' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#009fe1' }}>{s.value}</p>
                  <p className="mt-1 text-xs tracking-wider" style={{ color: '#94A3B8', letterSpacing: '0.06em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ MODULES ════════ */}
        <section id="modules" style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
            <FadeIn>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#009fe1', letterSpacing: '0.12em' }}>Modules</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" style={{ color: '#0F172A' }}>
                Votre boîte à outils<br />
                <span style={{ color: '#64748B' }}>pour la recherche d&apos;emploi</span>
              </h2>
            </FadeIn>
            <div className="grid md:grid-cols-4 gap-px mt-16" style={{ background: '#E2E8F0' }}>
              {modules.map((m, i) => {
                const Icon = m.icon;
                return (
                  <FadeIn key={m.title} delay={i * 80}>
                    <Link href={m.href} className="block group" style={{ background: '#fff' }}>
                      <div className="p-10 h-full transition-all duration-300 group-hover:shadow-lg">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: `${m.color}12` }}>
                          <Icon className="w-6" style={{ color: m.color }} />
                        </div>
                        <h3 className="text-lg font-bold mb-3" style={{ color: '#0F172A' }}>{m.title}</h3>
                        <p className="text-sm leading-relaxed mb-8" style={{ color: '#64748B' }}>{m.desc}</p>
                        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase" style={{ color: m.color, letterSpacing: '0.08em' }}>
                          Explorer
                          <IconArrowRight className="w-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  </FadeIn>
                );
              })}
            </div>
            <FadeIn>
              <div className="mt-8 p-8 text-center" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', background: '#fff' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#0F172A' }}>Recommandations de formation personnalisées</p>
                <p className="text-sm" style={{ color: '#64748B' }}>
                  L&apos;IA croise vos résultats aux 4 modules et vous suggère les formations les plus adaptées parmi +200 programmes partenaires.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ════════ FLOW ════════ */}
        <section style={{ borderTop: '1px solid #E2E8F0' }}>
          <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
            <FadeIn>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#009fe1', letterSpacing: '0.12em' }}>Parcours</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" style={{ color: '#0F172A' }}>
                5 étapes pour<br />
                <span style={{ color: '#64748B' }}>décrocher le poste</span>
              </h2>
            </FadeIn>
            <div className="mt-16 space-y-6">
              {[
                { num: '01', title: 'Créez votre profil', desc: 'Inscrivez-vous gratuitement en 30 secondes.' },
                { num: '02', title: 'Évaluez-vous', desc: 'Passez les modules dans l\'ordre de votre choix.' },
                { num: '03', title: 'Analysez vos résultats', desc: 'Recevez des rapports détaillés avec recommandations de formation.' },
                { num: '04', title: 'Entraînez-vous', desc: 'Simulez des entretiens réels avec l\'IA et progressez.' },
                { num: '05', title: 'Décrochez le poste', desc: 'Postulez avec confiance, fort de votre préparation complète.' },
              ].map((s, i) => (
                <FadeIn key={s.num} delay={i * 60}>
                  <div className="flex items-start gap-6 p-6 transition-all duration-200 hover:translate-x-1" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', background: i === 0 ? '#F8FAFC' : '#fff' }}>
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold tracking-wider text-white"
                      style={{ background: i === 0 ? '#009fe1' : '#E2E8F0', color: i === 0 ? '#fff' : '#94A3B8' }}
                    >
                      {s.num}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>{s.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{s.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ BIG QUOTE ════════ */}
        <section style={{ borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <div className="max-w-5xl mx-auto px-6 py-24 md:py-28">
            <FadeIn>
              <p className="text-3xl md:text-4xl font-bold leading-[1.2] text-center max-w-4xl mx-auto" style={{ color: '#0F172A' }}>
                &ldquo;J&apos;ai testé des tonnes d&apos;outils. Rien ne vaut la personnalisation d&apos;Okjobs — l&apos;IA adapte chaque module à mon profil.&rdquo;
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: '#009fe1' }}>SM</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0F172A' }}>Sophie Martin</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>Développeuse Full Stack</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ════════ FEATURES ════════ */}
        <section id="features" style={{ borderTop: '1px solid #E2E8F0' }}>
          {[
            {
              title: 'Évaluez votre profil complet',
              desc: "Tests cognitifs, bilan de compétences, personnalité et entretien simulé : une photo à 360° de votre employabilité. L'IA analyse chaque résultat pour vous connaître mieux que vous-même.",
              stat: { value: '4', label: 'Modules complémentaires' },
              img: IMG_STUDENTS,
            },
            {
              title: 'Des recommandations sur mesure',
              desc: "À partir de vos résultats, l'IA identifie vos axes de progression et vous suggère des formations adaptées parmi notre catalogue de programmes partenaires.",
              stat: { value: '200+', label: 'Programmes de formation' },
              img: IMG_ELECTRICIAN,
            },
            {
              title: 'Suivez votre progression',
              desc: "Chaque module garde l'historique de vos sessions. Visualisez l'évolution de vos scores et mesurez vos progrès dans le temps.",
              stat: { value: 'Complet', label: 'Historique détaillé' },
              img: IMG_STUDENTS,
            },
            {
              title: 'Certifiez vos acquis',
              desc: 'Partagez vos résultats de bilan et de personnalité avec les recruteurs. Montrez une connaissance approfondie de votre profil professionnel.',
              stat: { value: 'PDF', label: 'Rapports exportables' },
              img: IMG_ELECTRICIAN,
            },
          ].map((f, i) => (
            <div key={f.title} style={{ borderBottom: '1px solid #E2E8F0', background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
              <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
                <div className={`flex flex-col md:flex-row gap-16 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                  <FadeIn delay={i * 50} threshold={0.12}>
                    <div className="flex-1">
                      <img src={f.img} alt="" className="w-full rounded-lg" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} loading="lazy" />
                    </div>
                  </FadeIn>
                  <FadeIn delay={i * 50} threshold={0.12}>
                    <div className="flex-1">
                      <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#009fe1', letterSpacing: '0.12em' }}>0{i + 1}</p>
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-6" style={{ color: '#0F172A' }}>{f.title}</h2>
                      <p className="text-base leading-relaxed mb-8" style={{ color: '#64748B' }}>{f.desc}</p>
                      <div className="inline-flex items-center gap-4 px-5 py-3" style={{ border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                        <span className="text-2xl font-bold" style={{ color: '#009fe1' }}>{f.stat.value}</span>
                        <span className="text-sm" style={{ color: '#64748B' }}>{f.stat.label}</span>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ════════ TESTIMONIALS ════════ */}
        <section style={{ borderTop: '1px solid #E2E8F0' }}>
          <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
            <FadeIn>
              <p className="text-xs font-bold tracking-widest uppercase text-center mb-4" style={{ color: '#009fe1', letterSpacing: '0.12em' }}>Témoignages</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center leading-[1.05]" style={{ color: '#0F172A' }}>
                Ne nous croyez pas sur parole
              </h2>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-px mt-16" style={{ background: '#E2E8F0' }}>
              {testimonials.map((t, i) => (
                <FadeIn key={t.name} delay={i * 80}>
                  <div className="p-8 flex flex-col justify-between" style={{ background: '#fff', minHeight: '220px' }}>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: '#334155' }}>&ldquo;{t.text}&rdquo;</p>
                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                      <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{t.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{t.role}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-bold tracking-wide transition-colors"
                style={{ color: '#009fe1' }}
              >
                Rejoignez +10 000 candidats
                <IconArrowRight className="w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ════════ RECRUITERS ════════ */}
        <section style={{ borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5">
                <FadeIn>
                  <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#009fe1', letterSpacing: '0.12em' }}>Recruteurs</p>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" style={{ color: '#0F172A' }}>
                    Évaluez vos candidats<br />
                    <span style={{ color: '#64748B' }}>sur tous les plans</span>
                  </h2>
                  <p className="mt-6 text-base leading-relaxed" style={{ color: '#475569' }}>
                    Proposez à vos candidats un parcours complet : tests cognitifs, bilan de compétences,
                    personnalité et entretien. Recevez des rapports détaillés.
                  </p>
                  <div className="mt-8">
                    <Link
                      href="/register"
                      className="group inline-flex items-center gap-3 px-6 py-3 text-white text-sm font-bold tracking-wide transition-all duration-200"
                      style={{ background: '#009fe1', borderRadius: '6px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#0088cc'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#009fe1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      Essayer gratuitement
                      <IconArrowRight className="w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </FadeIn>
              </div>
              <div className="lg:col-span-7">
                <div className="grid sm:grid-cols-2 gap-px" style={{ background: '#E2E8F0' }}>
                  {[
                    { icon: IconBrain, title: 'Tests cognitifs', desc: 'Évaluez raisonnement logique, mathématique et verbal.' },
                    { icon: IconCertificate, title: 'Bilan de compétences', desc: 'Cartographie précise des soft skills.' },
                    { icon: IconStar, title: 'Profil de personnalité', desc: "Comprenez les traits Big Five et l'adéquation culturelle." },
                    { icon: IconTrophy, title: 'Rapports consolidés', desc: 'Synthèse multiaxial avec recommandations.' },
                  ].map((rf, i) => {
                    const Icon = rf.icon;
                    return (
                      <FadeIn key={rf.title} delay={i * 60}>
                        <div className="p-8 transition-all duration-200 hover:shadow-md" style={{ background: '#fff' }}>
                          <Icon className="w-6 mb-4" style={{ color: '#009fe1' }} />
                          <h3 className="text-base font-bold mb-2" style={{ color: '#0F172A' }}>{rf.title}</h3>
                          <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{rf.desc}</p>
                        </div>
                      </FadeIn>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ VISUAL BREAK ════════ */}
        <section className="h-64 md:h-80 overflow-hidden" style={{ borderTop: '1px solid #E2E8F0' }}>
          <img src={IMG_FAITHFUL} alt="" className="w-full h-full object-cover" loading="lazy" />
        </section>

        {/* ════════ FINAL CTA ════════ */}
        <section className="relative overflow-hidden" style={{ background: '#0F172A', borderTop: '1px solid #1E293B' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(0,159,225,0.08) 0%, transparent 60%)' }} />
          <div className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center relative z-10">
            <FadeIn>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#009fe1', letterSpacing: '0.12em' }}>C&apos;est gratuit</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-white">
                Prêt à passer à<br />
                la vitesse supérieure ?
              </h2>
              <p className="mt-6 text-base leading-relaxed max-w-md mx-auto" style={{ color: '#94A3B8' }}>
                Accès gratuit à tous les modules. Pas de carte bancaire. Rejoignez les candidats
                qui préparent leur avenir avec Okjobs.
              </p>
              <div className="mt-10">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-3 px-8 py-4 text-sm font-bold tracking-wide transition-all duration-200"
                  style={{ background: '#009fe1', color: '#fff', borderRadius: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0088cc'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#009fe1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Créer mon compte gratuit
                  <IconArrowRight className="w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="mt-4 text-xs" style={{ color: '#475569' }}>
                3 entretiens et tous les modules gratuits · Sans engagement
              </p>
            </FadeIn>
          </div>
        </section>

      </main>

      <div className="sticky-cta-mobile">
        <Link
          href="/register"
          className="flex items-center justify-center gap-3 px-6 py-4 text-white font-bold tracking-wide transition-colors"
          style={{ background: '#009fe1' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0088cc'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#009fe1'; }}
        >
          Créer mon compte gratuit
          <IconArrowRight className="w-4" />
        </Link>
      </div>

      <Footer />
    </>
  );
}
