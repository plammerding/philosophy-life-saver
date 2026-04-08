import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'phil.osophy life saver',
  description: 'Philipps persönliches ADHS-freundliches Lebens-Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 pb-24 pt-6">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  );
}
