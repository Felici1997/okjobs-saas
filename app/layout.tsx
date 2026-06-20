import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/lib/posthog/provider";
import { AuthProvider } from "@/lib/contexts/auth-context";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Okjobs - Préparez votre carrière avec l'IA",
  description:
    "Tests cognitifs, bilan de compétences, test de personnalité Big Five et entretiens simulés par IA. Une plateforme complète pour maîtriser chaque étape de votre recherche d'emploi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="corporate">
      <body className={`${jakarta.variable} antialiased`}>
        <PostHogProvider>
          <AuthProvider>{children}</AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
