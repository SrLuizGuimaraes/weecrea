// "Ver como cliente": a área da loja só para leitura, com faixa no topo. Dono: M11.
// Por enquanto mostra o Painel da loja (M9); as outras telas da loja entram aqui quando lerem o banco.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eye } from 'lucide-react';
import { CabecalhoPagina } from '@/componentes';
import { exigirWeethub } from '@/lib/acesso';
import { dados } from '@/lib/dados-exemplo';
import { PainelLoja, type ParamsPainel } from '@/modulos/m9-painel/painel-loja';

export default async function VerComoCliente({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<ParamsPainel> }) {
  await exigirWeethub();
  const { id } = await params;
  const loja = dados.lojas.find((l) => l.id === id);
  if (!loja) notFound();
  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-6 flex flex-wrap items-center justify-between gap-2 bg-aviso px-4 py-2 text-sm font-medium text-fundo md:-mx-7 md:-mt-7 md:px-7">
        <span className="flex items-center gap-2"><Eye size={16} />Você está vendo como {loja.nome}, só para leitura.</span>
        <Link href={`/weethub/empresas/${id}`} className="underline">Sair da visão do cliente</Link>
      </div>
      <CabecalhoPagina titulo="Painel" descricao={`O que ${loja.nome} vê no painel de vendas.`} />
      <PainelLoja lojaId={id} params={await searchParams} base={`/weethub/empresas/${id}/ver`} />
    </>
  );
}
