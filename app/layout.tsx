import type { Metadata } from 'next';

import {
  Geist,
  Geist_Mono,
} from 'next/font/google';

import './globals.css';

import Header from '@/app/components/Header';
import Footer from './components/Footer';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title:
    'CAMX.lk | CCTV & Smart Security Solutions',

  description:
    'Professional CCTV cameras, security systems, biometric access control, and smart surveillance solutions in Sri Lanka.',

  keywords: [
    'CCTV Sri Lanka',
    'Security Cameras',
    'DVR Systems',
    'NVR Systems',
    'Biometric Systems',
    'CAMX.lk',
    'Smart Security',
  ],

  authors: [
    {
      name: 'CAMX.lk',
    },
  ],

  creator: 'CAMX.lk',

  metadataBase: new URL(
    'https://camx.lk'
  ),

  openGraph: {
    title:
      'CAMX.lk | CCTV & Smart Security Solutions',

    description:
      'Advanced CCTV cameras and smart surveillance systems for homes and businesses.',

    url: 'https://camx.lk',

    siteName: 'CAMX.lk',

    images: [
      {
        url: '/hero-cctv.jpg',
        width: 1200,
        height: 630,
        alt: 'CAMX.lk Security Solutions',
      },
    ],

    locale: 'en_US',

    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',

    title:
      'CAMX.lk | CCTV & Smart Security Solutions',

    description:
      'Professional CCTV & Smart Security Systems.',

    images: ['/hero-cctv.jpg'],
  },

  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning අනිවාර්යයි, සහ hardcoded "dark" අයින් කළා
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-white dark:bg-[#050816] text-gray-900 dark:text-white min-h-screen antialiased">
        
        {/* Providers හරහා තමයි theme එක auto detect වෙන්නේ */}
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>

      </body>
    </html>
  );
}