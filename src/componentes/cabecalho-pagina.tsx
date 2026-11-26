// Cabeçalho de página em cartão, com o ícone da página (como o protótipo). Dono: M2.
// <CabecalhoPagina titulo="Campanhas" descricao="..." acoes={<BotaoLink href="/loja/campanhas/nova">Nova campanha</BotaoLink>} />
import type { ReactNode } from 'react';
import { IconePagina } from './icone-pagina';

export function CabecalhoPagina({ titulo, descricao, acoes, voltar, semIcone }: { titulo: ReactNode; descricao?: ReactNode; acoes?: ReactNode; voltar?: ReactNode; semIcone?: boolean }) {
  return (
    <header className="mb-6 rounded-cartao border border-borda bg-superficie px-5 py-4">
      {voltar && <div className="mb-2 text-sm text-suave">{voltar}</div>}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          {!semIcone && <IconePagina />}
          <div className="min-w-0">
            <h1 className="text-[21px] font-bold leading-tight tracking-tight">{titulo}</h1>
            {descricao && <p className="mt-0.5 text-sm text-suave">{descricao}</p>}
          </div>
        </div>
        {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
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
        <main className="mx-auto max-w-[1180px] p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
}
