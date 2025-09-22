import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthModalWrapper from '@/components/AuthModalWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BlueShield - Ocean Microplastic Prediction & Risk Assessment',
  description: 'Advanced AI-powered microplastic prediction and marine life risk assessment system for ocean conservation.',
  keywords: 'microplastics, ocean pollution, marine conservation, AI prediction, risk assessment, environmental protection',
  authors: [{ name: 'BlueShield Team' }],
  openGraph: {
    title: 'BlueShield - Protecting Our Oceans',
    description: 'Advanced microplastic prediction and risk assessment for marine conservation',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlueShield - Ocean Microplastic Prediction',
    description: 'Advanced AI-powered microplastic prediction and marine life risk assessment',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${geistSans.className} antialiased`}>
        <AuthProvider>
          <AuthModalWrapper />
          {children}
          <AuthModalWrapper />
          </AuthProvider>
      </body>
    </html>
  );
}
