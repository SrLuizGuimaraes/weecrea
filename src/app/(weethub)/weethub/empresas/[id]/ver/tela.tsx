'use client';
// "Ver como cliente": telas da loja só para leitura, com faixa no topo. Dono: M11.
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Abas, Aviso } from '@/componentes';
import { useDemo } from '@/lib/demo/estado';
import { PainelLoja, type ParamsPainel } from '@/modulos/m9-painel/painel-loja';
import { TelaFinanceiroLoja } from '@/app/(loja)/loja/financeiro/tela';

export function TelaVerComoCliente({ id, usuarioId, params }: { id: string; usuarioId: string; params: ParamsPainel & { tela?: string; aba?: string; p?: string } }) {
  const { D } = useDemo();
  const loja = D.lojas.find((l) => l.id === id);
  if (!loja) return <Aviso tom="perigo">Empresa não encontrada.</Aviso>;
  const tela = params.tela === 'financeiro' ? 'financeiro' : 'painel';
  const base = `/weethub/empresas/${id}/ver`;
  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-6 flex flex-wrap items-center justify-between gap-2 bg-aviso px-4 py-2 text-sm font-medium text-fundo md:-mx-7 md:-mt-7 md:px-7">
        <span className="flex items-center gap-2"><Eye size={16} />Você está vendo como {loja.nome}, só para leitura.</span>
        <Link href={`/weethub/empresas/${id}`} className="underline">Sair da visão do cliente</Link>
      </div>
      <div className="mb-4"><Abas ativa={tela} abas={[
        { chave: 'painel', rotulo: 'Painel', href: `${base}?tela=painel` },
        { chave: 'financeiro', rotulo: 'Financeiro', href: `${base}?tela=financeiro` },
      ]} /></div>
      {tela === 'financeiro'
        ? <TelaFinanceiroLoja lojaId={id} usuarioId={usuarioId} aba={params.aba} pagina={Number(params.p) || 1} somenteLeitura prefixo="?tela=financeiro&" />
        : <PainelLoja lojaId={id} params={params} base={base} />}
    </>
  );
}
