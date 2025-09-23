import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthModalWrapper from '@/components/AuthModalWrapper';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'BlueShield - Ocean Microplastic Prediction & Risk Assessment',
  description: 'Integrated framework for prediction of microplastics and assessment of human health and marine ecosystem risks from ocean plastic pollution.',
  keywords: 'microplastics, ocean pollution, human health, marine ecosystem, AI prediction, risk assessment, integrated framework',
  authors: [{ name: 'BlueShield Team' }],
  openGraph: {
    title: 'BlueShield - Protecting Our Oceans',
    description: 'Integrated framework for prediction of microplastics and assessment of human health and marine ecosystem risks',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlueShield - Ocean Microplastic Prediction',
    description: 'Integrated framework for prediction of microplastics and assessment of human health and marine ecosystem risks',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className={`${poppins.className} antialiased`}>
        <AuthProvider>
          <Header />
          <AuthModalWrapper />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
