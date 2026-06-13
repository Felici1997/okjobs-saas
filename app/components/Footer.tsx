import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black/[0.02] border-t border-black/5">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Okjobs" className="h-8 w-auto" />
            </Link>
            <p className="mt-2 text-sm text-black/40 max-w-md">
              La plateforme d&apos;entraînement aux entretiens d&apos;embauche propulsée par l&apos;IA.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-black/40">
            <Link href="/about" className="hover:text-black/60 transition-colors">À propos</Link>
            <Link href="/contact" className="hover:text-black/60 transition-colors">Contact</Link>
            <Link href="/api-docs" className="hover:text-black/60 transition-colors">API</Link>
          </div>
        </div>
        <div className="border-t border-black/5 mt-8 pt-6 text-center text-xs text-black/30">
          &copy; {new Date().getFullYear()} Okjobs.
        </div>
      </div>
    </footer>
  );
}
