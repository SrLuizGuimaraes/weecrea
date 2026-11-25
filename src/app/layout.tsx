import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WEECREA',
  description: 'Gestão de creators de UGC para lojas Nuvemshop',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
