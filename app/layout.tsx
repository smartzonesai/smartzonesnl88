import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { displayFont, bodyFont, serifFont } from '@/lib/fonts';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import StructuredData from '@/components/StructuredData';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://smartzones.nl'),
  title: {
    default: 'Smart Zones — AI Winkeloptimalisatie Platform',
    template: '%s — Smart Zones',
  },
  description:
    'Upload een video van uw winkel en ontvang binnen 1 uur een compleet optimalisatieplan. AI-gestuurde vloerindeling, productplaatsing en klantenstroom-analyse voor €199.',
  keywords: [
    'winkelindeling',
    'winkeloptimalisatie',
    'klantstroomanalyse',
    'retail optimalisatie',
    'winkelinrichting',
    'plattegrond',
    'Breda',
    'Eindhoven',
    'Tilburg',
    'Noord-Brabant',
    'AI platform',
    'video analyse',
    'winkel dashboard',
    'online winkeloptimalisatie',
  ],
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://smartzones.nl',
    siteName: 'Smart Zones',
    title: 'Smart Zones — AI Winkeloptimalisatie Platform',
    description:
      'Upload een video van uw winkel en ontvang binnen 1 uur een compleet optimalisatieplan. AI-gestuurde vloerindeling, productplaatsing en klantenstroom-analyse voor €199.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Smart Zones — AI Winkeloptimalisatie Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Zones — AI Winkeloptimalisatie Platform',
    description:
      'Upload een video van uw winkel en ontvang binnen 1 uur een compleet optimalisatieplan. AI-gestuurde vloerindeling, productplaatsing en klantenstroom-analyse voor €199.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/manifest.json',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://smartzones.nl' },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hide navbar/footer on dashboard and admin routes
  const headersList = await headers();
  const pathname = headersList.get('x-next-pathname') || headersList.get('x-invoke-path') || '';
  const isApp = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  return (
    <html
      lang="nl"
      className={`${displayFont.variable} ${bodyFont.variable} ${serifFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('sz-theme');if(!t)t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
      </head>
      <body className="grain relative">
        <ThemeProvider>
          <StructuredData />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-white"
          >
            Naar hoofdinhoud
          </a>
          <AppShell isApp={isApp}>{children}</AppShell>
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}

function AppShell({ isApp, children }: { isApp: boolean; children: React.ReactNode }) {
  if (isApp) {
    // Dashboard/admin pages — no navbar or footer
    return <>{children}</>;
  }
  // Public pages — full navbar + footer
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
