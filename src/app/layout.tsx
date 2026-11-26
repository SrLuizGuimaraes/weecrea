import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { ScriptTema } from '@/componentes/tema';
import { AvisoDaUrl, ProvedorToast } from '@/componentes/toast';
import { ProvedorDemo } from '@/lib/demo/estado';
import './globals.css';

export const metadata: Metadata = {
  title: 'WEECREA',
  description: 'Gestão de creators de UGC para lojas Nuvemshop',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ScriptTema />
      </head>
      <body className="min-h-screen antialiased">
        <ProvedorToast>
          <ProvedorDemo>{children}</ProvedorDemo>
          <Suspense><AvisoDaUrl /></Suspense>
        </ProvedorToast>
      </body>
    </html>
  );
}
