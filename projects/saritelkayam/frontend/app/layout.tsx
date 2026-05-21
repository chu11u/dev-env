import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/globals.css';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
   variable: '--font-playfair',
   display: 'swap',
 });

const inter = Inter({
  subsets: ['latin'],
   variable: '--font-inter',
   display: 'swap',
 });

export const metadata: Metadata = {
  title: 'Sarit Elkayam | Professional Cosmetician',
   description:
      'Professional cosmetician dedicated to enhancing your natural beauty. Book your appointment today for personalized skincare, makeup, and beauty treatments.',
   openGraph: {
     title: 'Sarit Elkayam | Professional Cosmetician',
      description:
         'Professional cosmetician dedicated to enhancing your natural beauty.',
     type: 'website',
     locale: 'en_US',
    },
  twitter: {
     card: 'summary',
      title: 'Sarit Elkayam | Professional Cosmetician',
      description:
         'Professional cosmetician dedicated to enhancing your natural beauty.',
    },
 };

export default function RootLayout({
  children,
}: {
   children: React.ReactNode;
 }) {
  return (
      <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
        <body
         className={`font-body bg-cream-50 text-charcoal-600 antialiased`}
        >
          <Header />
          <main className="min-h-screen" role="main">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    );
}
