'use client';
// Menu lateral das 3 áreas, com ícones. Dono: M2. No celular vira barra no topo com menu que abre.
import {
  BarChart3, Building2, Cable, Film, Home, LogOut, Megaphone, Menu, Package, Settings, Users, Wallet, X, Clapperboard, LineChart, Store, UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ComponentType } from 'react';
import type { Perfil } from '@/contratos/tipos';
import { cx } from './cx';
import { Logo } from './marca';
import { BotaoTema } from './tema';
import { AvisoDemonstracao } from '@/lib/demo/estado';

type Item = { href: string; rotulo: string; Icone: ComponentType<{ size?: number }> };

export const ITENS_MENU: Record<Perfil, Item[]> = {
  LOJA: [
    { href: '/loja/painel', rotulo: 'Painel', Icone: BarChart3 },
    { href: '/loja/campanhas', rotulo: 'Campanhas', Icone: Megaphone },
    { href: '/loja/creators', rotulo: 'Creators', Icone: Users },
    { href: '/loja/biblioteca', rotulo: 'Biblioteca', Icone: Film },
    { href: '/loja/produtos', rotulo: 'Produtos e cupons', Icone: Package },
    { href: '/loja/financeiro', rotulo: 'Financeiro', Icone: Wallet },
    { href: '/loja/conexoes', rotulo: 'Conexões', Icone: Cable },
    { href: '/loja/configuracoes', rotulo: 'Configurações', Icone: Settings },
  ],
  CREATOR: [
    { href: '/creator/inicio', rotulo: 'Início', Icone: Home },
    { href: '/creator/campanhas', rotulo: 'Campanhas', Icone: Megaphone },
    { href: '/creator/conteudos', rotulo: 'Conteúdos', Icone: Clapperboard },
    { href: '/creator/financeiro', rotulo: 'Financeiro', Icone: Wallet },
    { href: '/creator/marketplace', rotulo: 'Marketplace', Icone: Store },
    { href: '/creator/perfil', rotulo: 'Perfil', Icone: UserRound },
  ],
  WEETHUB: [
    { href: '/weethub', rotulo: 'Painel', Icone: BarChart3 },
    { href: '/weethub/empresas', rotulo: 'Empresas', Icone: Building2 },
    { href: '/weethub/creators', rotulo: 'Creators', Icone: Users },
    { href: '/weethub/receita', rotulo: 'Receita', Icone: LineChart },
  ],
};

export function MenuLateral({ perfil, titulo, nome, sair }: { perfil: Perfil; titulo: string; nome: string; sair: () => Promise<void> }) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);
  const ativo = (href: string) => caminho === href || (href !== '/weethub' && caminho.startsWith(`${href}/`));
  return (
    <aside className="sticky top-0 z-30 border-b border-borda bg-fundo md:h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0">
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="min-w-0">
          <Logo alturaClasse="h-7" />
          <p className="truncate text-xs text-suave">{titulo}</p>
        </div>
        <button type="button" className="rounded-lg p-2 hover:bg-superficie-2 md:hidden" onClick={() => setAberto(!aberto)} aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={aberto}>
          {aberto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div className={cx('flex-col px-3 pb-4 md:flex md:h-[calc(100vh-76px)]', aberto ? 'flex' : 'hidden')}>
        <nav className="flex flex-col gap-0.5">
          {ITENS_MENU[perfil].map(({ href, rotulo, Icone }) => (
            <Link key={href} href={href} onClick={() => setAberto(false)} aria-current={ativo(href) ? 'page' : undefined}
              className={cx('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                ativo(href) ? 'bg-superficie-2 font-semibold text-texto' : 'font-medium text-texto hover:bg-superficie-2')}>
              <Icone size={18} />{rotulo}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-3"><AvisoDemonstracao /></div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-borda pt-3">
          <p className="min-w-0 truncate text-sm">{nome}</p>
          <div className="flex gap-1">
            <BotaoTema />
            <form action={sair}>
              <button type="submit" aria-label="Sair" title="Sair" className="inline-flex size-9 items-center justify-center rounded-lg border border-borda hover:bg-superficie-2"><LogOut size={16} /></button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
