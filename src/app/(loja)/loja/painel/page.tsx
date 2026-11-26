// Painel de vendas da loja. Dono: M9. Dados de exemplo por enquanto (src/modulos/m9-painel/dados.ts).
import { CabecalhoPagina } from '@/componentes';
import { exigirLoja } from '@/lib/acesso';
import { PainelLoja, type ParamsPainel } from '@/modulos/m9-painel/painel-loja';

export default async function PainelDaLoja({ searchParams }: { searchParams: Promise<ParamsPainel> }) {
  const { lojaId } = await exigirLoja();
  return (
    <>
      <CabecalhoPagina titulo="Painel" descricao="Vendas com cupom dos seus creators, por período ou por creator." />
      <PainelLoja lojaId={lojaId} params={await searchParams} base="/loja/painel" />
    </>
  );
}
