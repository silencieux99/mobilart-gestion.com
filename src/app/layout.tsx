import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mobilart Gestion - Plateforme de Gestion de Copropriété',
  description: 'Plateforme moderne de gestion pour la résidence Mobilart à Oran. Gérez vos incidents, factures, réservations et bien plus.',
  keywords: 'copropriété, gestion, résidence, Mobilart, Oran, Algérie, syndic, incidents, factures',
  authors: [{ name: 'Mobilart Gestion' }],
  creator: 'Mobilart Gestion',
  publisher: 'Mobilart Gestion',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mobilart-gestion.com'),
  openGraph: {
    title: 'Mobilart Gestion - Plateforme de Gestion de Copropriété',
    description: 'Plateforme moderne de gestion pour la résidence Mobilart à Oran',
    url: 'https://mobilart-gestion.com',
    siteName: 'Mobilart Gestion',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mobilart Gestion',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobilart Gestion',
    description: 'Plateforme moderne de gestion pour la résidence Mobilart',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#06B6D4' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased bg-sand-50">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
