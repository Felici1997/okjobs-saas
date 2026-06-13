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
  title: "Okjobs - Entraînement aux entretiens d'embauche",
  description:
    "Préparez-vous à vos entretiens d'embauche avec l'IA. Entraînez-vous en conditions réelles et recevez des feedbacks personnalisés.",
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
