import type { Metadata } from 'next';
import './globals.css';
import Nav from './nav';

export const metadata: Metadata = {
  title: 'Checklist DM',
  description: 'Agenda y congresos - Dental Medrano',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <Nav />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
