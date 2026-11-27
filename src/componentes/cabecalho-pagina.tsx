// Cabeçalho de página em cartão. Dono: M2.
// <CabecalhoPagina titulo="Campanhas" descricao="..." acoes={<BotaoLink href="/loja/campanhas/nova">Nova campanha</BotaoLink>} />
import type { ReactNode } from 'react';

export function CabecalhoPagina({ titulo, descricao, acoes, voltar }: { titulo: ReactNode; descricao?: ReactNode; acoes?: ReactNode; voltar?: ReactNode }) {
  return (
    <header className="mb-6 rounded-xl border border-borda bg-superficie p-4 md:p-5">
      {voltar && <div className="mb-2 text-sm text-suave">{voltar}</div>}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{titulo}</h1>
          {descricao && <p className="mt-1 text-sm text-suave">{descricao}</p>}
        </div>
        {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
      </div>
    </header>
  );
}

/** Molde de área logada: menu + conteúdo. */
export function MoldeArea({ menu, children, faixa }: { menu: ReactNode; children: ReactNode; faixa?: ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      {menu}
      <div className="min-w-0 flex-1">
        {faixa}
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
