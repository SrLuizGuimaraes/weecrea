// Creators da loja. Dono: M7.
import { exigirLoja } from '@/lib/acesso';
import { carregarDadosLoja } from '@/lib/dados-reais';
import { ProvedorDados } from '@/lib/dados-reais-cliente';
import { hojeSP } from '@/lib/datas';
import { TelaCreators } from './tela';

export default async function Creators({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba } = await searchParams;
  const D = await carregarDadosLoja(lojaId, hojeSP());
  return <ProvedorDados D={D}><TelaCreators lojaId={lojaId} aba={aba} /></ProvedorDados>;
}
