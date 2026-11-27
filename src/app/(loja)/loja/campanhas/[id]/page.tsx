// Detalhe da campanha. Dono: M5.
import { exigirLoja } from '@/lib/acesso';
import { carregarDadosLoja } from '@/lib/dados-reais';
import { ProvedorDados } from '@/lib/dados-reais-cliente';
import { hojeSP } from '@/lib/datas';
import { TelaDetalheCampanha } from './tela';

export default async function DetalheCampanha({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { id } = await params;
  const { aba } = await searchParams;
  const D = await carregarDadosLoja(lojaId, hojeSP());
  return <ProvedorDados D={D}><TelaDetalheCampanha lojaId={lojaId} id={id} aba={aba} /></ProvedorDados>;
}
