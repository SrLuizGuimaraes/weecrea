// Página pública de cadastro de creators da loja. Dono: M6. Dados de exemplo; o envio só simula.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgePercent, Megaphone, Ticket } from 'lucide-react';
import { bpsParaTexto } from '@/dominio/dinheiro';
import { formatarData } from '@/lib/datas';
import { dados } from '@/lib/dados-exemplo';
import { FormCadastro } from '@/modulos/m6-cadastro/form-cadastro';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ campanha?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const loja = dados.lojas.find((l) => l.slug === slug);
  return { title: loja ? `${loja.paginaCadastro.titulo} · ${loja.nome}` : 'WEECREA' };
}

export default async function PaginaCadastro({ params, searchParams }: Props) {
  const { slug } = await params;
  const { campanha: campanhaId } = await searchParams;
  const loja = dados.lojas.find((l) => l.slug === slug);
  if (!loja) notFound();
  const ativas = dados.campanhas.filter((k) => k.lojaId === loja.id && k.status === 'ativa' && k.visibilidade === 'aberta');
  const convite = campanhaId ? dados.campanhas.find((k) => k.id === campanhaId && k.lojaId === loja.id) : undefined;
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
            <FormCadastro lojaNome={loja.nome} desconto={loja.cupomDescontoPct} criterios={loja.criterios} />
          </section>
        </>
      )}
      <p className="mt-8 text-center text-xs text-suave">Feito com WEECREA · Weethub</p>
    </main>
  );
}
