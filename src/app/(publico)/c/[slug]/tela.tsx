'use client';
// Página pública de cadastro de creators da loja. Dono: M6. Estado da demonstração.
import { BadgePercent, Megaphone, Ticket } from 'lucide-react';
import { bpsParaTexto } from '@/dominio/dinheiro';
import { formatarData } from '@/lib/datas';
import { useDemo } from '@/lib/demo/estado';
import { FormCadastro } from '@/modulos/m6-cadastro/form-cadastro';

export function TelaCadastro({ slug, campanhaId, origem }: { slug: string; campanhaId?: string; origem?: 'link' | 'qr_code' | 'email' | 'pagina' }) {
  const { D } = useDemo();
  const loja = D.lojas.find((l) => l.slug === slug);
  if (!loja) return <main className="mx-auto max-w-lg px-4 py-16 text-center"><h1 className="text-xl font-semibold">Página não encontrada</h1><p className="mt-2 text-suave">Confira o link que você recebeu.</p></main>;
  const ativas = D.campanhas.filter((k) => k.lojaId === loja.id && k.status === 'ativa' && k.visibilidade === 'aberta');
  const convite = campanhaId ? D.campanhas.find((k) => k.id === campanhaId && k.lojaId === loja.id) : undefined;
  const fechada = !loja.paginaCadastro.aberta || loja.status === 'suspensa' || loja.status === 'cancelada';

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6 text-center">
        <p className="text-sm font-semibold text-destaque">{loja.nome}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{loja.paginaCadastro.titulo}</h1>
        {loja.paginaCadastro.texto && <p className="mt-2 text-suave">{loja.paginaCadastro.texto}</p>}
      </header>

      {fechada ? (
        <div className="rounded-2xl border border-borda bg-superficie p-6 text-center">
          <h2 className="text-lg font-semibold">Inscrições fechadas</h2>
          <p className="mt-1 text-sm text-suave">A {loja.nome} não está recebendo novos creators agora. Volte em breve.</p>
        </div>
      ) : (
        <>
          {convite && (
            <div className="mb-4 rounded-cartao bg-destaque-fraco p-4 text-sm">
              Você foi convidada(o) para a campanha <b>{convite.nome}</b>, de {formatarData(convite.inicio)} a {formatarData(convite.fim)}.
            </div>
          )}
          <section className="mb-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-cartao border border-borda bg-superficie p-3"><BadgePercent size={18} className="mx-auto text-destaque" />
              <p className="mt-1 text-lg font-semibold">{bpsParaTexto(loja.comissaoPadraoBps)}</p><p className="text-xs text-suave">de comissão</p></div>
            <div className="rounded-cartao border border-borda bg-superficie p-3"><Ticket size={18} className="mx-auto text-destaque" />
              <p className="mt-1 text-lg font-semibold">{loja.cupomDescontoPct}%</p><p className="text-xs text-suave">cupom exclusivo</p></div>
            <div className="rounded-cartao border border-borda bg-superficie p-3"><Megaphone size={18} className="mx-auto text-destaque" />
              <p className="mt-1 text-lg font-semibold">{ativas.length}</p><p className="text-xs text-suave">campanha(s) ativa(s)</p></div>
          </section>

          <section className="mb-6 rounded-2xl border border-borda bg-superficie p-4">
            <h2 className="mb-3 font-semibold">Como funciona</h2>
            <ol className="space-y-2 text-sm">
              {['Você se cadastra aqui.', `A ${loja.nome} aprova o seu perfil${loja.criterios.aprovacaoAutomatica ? ' (pode ser na hora)' : ''}.`,
                'Você recebe um cupom só seu e aceita as campanhas.', 'Cada venda com o seu cupom gera comissão para você.'].map((t, i) => (
                <li key={i} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-texto text-xs font-semibold text-fundo">{i + 1}</span>{t}</li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-borda bg-superficie p-4">
            <h2 className="mb-4 font-semibold">Seu cadastro</h2>
            <FormCadastro slug={loja.slug} lojaNome={loja.nome} campanhaId={convite?.id} origem={origem} />
          </section>
        </>
      )}
      <p className="mt-8 text-center text-xs text-suave">Feito com WEECREA · Weethub · <button type="button" onClick={() => history.back()} className="underline">Voltar</button></p>
    </main>
  );
}
