// Tabela com rolagem lateral no celular, abas em pílula e paginação. Dono: M2.
// <Tabela colunas={['Nome', 'Vendas']} alinharDireita={[1]}>{linhas.map(l => <tr key=..><Td>..</Td></tr>)}</Tabela>
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cx } from './cx';

export function Tabela({ colunas, children, vazio = 'Nada por aqui ainda.', alinharDireita = [] }:
  { colunas: ReactNode[]; children: ReactNode; vazio?: string; alinharDireita?: number[] }) {
  const temLinhas = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="overflow-x-auto rounded-xl border border-borda bg-superficie">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-borda text-left text-xs uppercase tracking-wide text-suave">
            {colunas.map((c, i) => (
              <th key={i} className={cx('px-4 py-3 font-medium', alinharDireita.includes(i) && 'text-right')}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:not(:last-child)]:border-b [&>tr]:border-borda">
          {temLinhas ? children : (
            <tr><td colSpan={colunas.length} className="px-4 py-8 text-center text-suave">{vazio}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, direita, className, colSpan }: { children?: ReactNode; direita?: boolean; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={cx('px-4 py-3 align-middle', direita && 'text-right tabular-nums', className)}>{children}</td>;
}

export function Abas({ abas, ativa }: { abas: { chave: string; rotulo: ReactNode; href: string }[]; ativa: string }) {
  return (
    <nav className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-borda bg-superficie p-1" aria-label="Abas">
      {abas.map((a) => (
        <Link key={a.chave} href={a.href} aria-current={a.chave === ativa ? 'page' : undefined}
          className={cx('whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition',
            a.chave === ativa ? 'bg-texto text-fundo' : 'text-suave hover:text-texto')}>
          {a.rotulo}
        </Link>
      ))}
    </nav>
  );
}

export function Paginacao({ pagina, totalPaginas, hrefDaPagina }: { pagina: number; totalPaginas: number; hrefDaPagina: (n: number) => string }) {
  if (totalPaginas <= 1) return null;
  const botao = 'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-borda px-2 text-sm';
  return (
    <nav className="flex items-center justify-between gap-2 text-sm" aria-label="Paginação">
      {pagina > 1 ? <Link href={hrefDaPagina(pagina - 1)} className={botao}>Anterior</Link> : <span className={cx(botao, 'opacity-40')}>Anterior</span>}
      <span className="text-suave">Página {pagina} de {totalPaginas}</span>
      {pagina < totalPaginas ? <Link href={hrefDaPagina(pagina + 1)} className={botao}>Próxima</Link> : <span className={cx(botao, 'opacity-40')}>Próxima</span>}
    </nav>
  );
}

/** Ajuda para paginar uma lista já carregada. */
export function paginar<T>(lista: T[], pagina: number, porPagina = 20) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
  const atual = Math.min(Math.max(1, pagina || 1), totalPaginas);
  return { itens: lista.slice((atual - 1) * porPagina, atual * porPagina), pagina: atual, totalPaginas };
}
