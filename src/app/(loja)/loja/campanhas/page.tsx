// Campanhas da loja. Dono: M5.
import { exigirLoja } from '@/lib/acesso';
import { carregarDadosLoja } from '@/lib/dados-reais';
import { ProvedorDados } from '@/lib/dados-reais-cliente';
import { hojeSP } from '@/lib/datas';
import { TelaCampanhas } from './tela';

export default async function Campanhas({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba } = await searchParams;
  const D = await carregarDadosLoja(lojaId, hojeSP());
  return <ProvedorDados D={D}><TelaCampanhas lojaId={lojaId} aba={aba} /></ProvedorDados>;
}
