import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Vagas TI - Encontre vagas de tecnologia',
    template: '%s | Vagas TI',
  },
  description: 'Interface pública para buscar, filtrar e explorar vagas de tecnologia consumindo uma API REST.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
