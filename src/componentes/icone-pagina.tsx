'use client';
// Ícone do cabeçalho de página: o mesmo do item do menu da página atual. Dono: M2.
import { usePathname } from 'next/navigation';
import { ITENS_MENU } from './menu-lateral';

const TODOS = [...ITENS_MENU.LOJA, ...ITENS_MENU.CREATOR, ...ITENS_MENU.WEETHUB];

export function IconePagina() {
  const caminho = usePathname();
  const item = TODOS.filter((i) => caminho === i.href || caminho.startsWith(`${i.href}/`)).sort((a, b) => b.href.length - a.href.length)[0];
  if (!item) return null;
  const { Icone } = item;
  return (
    <span className="grid size-[42px] shrink-0 place-items-center rounded-controle bg-superficie-2" aria-hidden="true">
      <Icone size={21} />
    </span>
  );
}
