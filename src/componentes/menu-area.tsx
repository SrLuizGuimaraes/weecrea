// Menu das 3 áreas. Versão provisória do M1; o M2 troca pelo visual final (menu lateral com ícones).
import Link from 'next/link';
import type { Perfil } from '@/contratos/tipos';

export const ITENS_MENU: Record<Perfil, { href: string; rotulo: string }[]> = {
  LOJA: [
    { href: '/loja/painel', rotulo: 'Painel' },
    { href: '/loja/campanhas', rotulo: 'Campanhas' },
    { href: '/loja/creators', rotulo: 'Creators' },
    { href: '/loja/biblioteca', rotulo: 'Biblioteca' },
    { href: '/loja/produtos', rotulo: 'Produtos e cupons' },
    { href: '/loja/financeiro', rotulo: 'Financeiro' },
    { href: '/loja/conexoes', rotulo: 'Conexões' },
    { href: '/loja/configuracoes', rotulo: 'Configurações' },
  ],
  CREATOR: [
    { href: '/creator/inicio', rotulo: 'Início' },
    { href: '/creator/campanhas', rotulo: 'Campanhas' },
    { href: '/creator/conteudos', rotulo: 'Conteúdos' },
    { href: '/creator/financeiro', rotulo: 'Financeiro' },
  ],
  WEETHUB: [
    { href: '/weethub', rotulo: 'Painel' },
    { href: '/weethub/empresas', rotulo: 'Empresas' },
    { href: '/weethub/creators', rotulo: 'Creators' },
    { href: '/weethub/receita', rotulo: 'Receita' },
  ],
};

export function MenuArea({ perfil, titulo, nome, sair }: {
  perfil: Perfil; titulo: string; nome: string; sair: () => Promise<void>;
}) {
  return (
    <aside className="border-b border-[var(--borda)] p-4 md:min-h-screen md:w-60 md:border-r md:border-b-0">
      <p className="text-lg font-semibold">WEECREA</p>
      <p className="mb-4 text-xs opacity-60">{titulo}</p>
      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {ITENS_MENU[perfil].map((i) => (
          <Link key={i.href} href={i.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
            {i.rotulo}
          </Link>
        ))}
      </nav>
      <form action={sair} className="mt-4 text-sm">
        <p className="truncate opacity-70">{nome}</p>
        <button type="submit" className="underline">Sair</button>
      </form>
    </aside>
  );
}
