import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-black/[0.02]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="https://kaxspqevfobiocbqkgkl.supabase.co/storage/v1/object/public/imagesLandingPage/Logo.jpg" alt="Okjobs" className="h-8 w-auto" />
            </Link>
            <p className="mt-4 text-sm text-black/40 max-w-sm leading-relaxed">
              La plateforme d&apos;entraînement aux entretiens d&apos;embauche propulsée par l&apos;IA.
              Préparez-vous efficacement et décrochez le poste.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-black/40 tracking-wider uppercase mb-4">Produit</p>
            <div className="flex flex-col gap-3">
              <Link href="/#features" className="text-sm text-black/50 hover:text-black transition-colors">Fonctionnalités</Link>
              <Link href="/#pricing" className="text-sm text-black/50 hover:text-black transition-colors">Tarifs</Link>
              <Link href="/api-docs" className="text-sm text-black/50 hover:text-black transition-colors">API</Link>
              <Link href="/blog" className="text-sm text-black/50 hover:text-black transition-colors">Blog</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-black/40 tracking-wider uppercase mb-4">Entreprise</p>
            <div className="flex flex-col gap-3">
              <Link href="/about" className="text-sm text-black/50 hover:text-black transition-colors">À propos</Link>
              <Link href="/contact" className="text-sm text-black/50 hover:text-black transition-colors">Contact</Link>
              <Link href="/recruiters" className="text-sm text-black/50 hover:text-black transition-colors">Recruteurs</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-black/5 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-black/30">&copy; {new Date().getFullYear()} Okjobs. Tous droits réservés.</p>
          <div className="flex items-center gap-6 text-xs text-black/30">
            <Link href="/terms" className="hover:text-black/50 transition-colors">Conditions d&apos;utilisation</Link>
            <Link href="/privacy" className="hover:text-black/50 transition-colors">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
