// Campanhas do creator. Dono: M5.
import { exigirCreator } from '@/lib/acesso';
import { carregarDadosCreator } from '@/lib/dados-reais';
import { ProvedorDados } from '@/lib/dados-reais-cliente';
import { hojeSP } from '@/lib/datas';
import { TelaCampanhasCreator } from './tela';

export default async function CampanhasCreator({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { creatorId } = await exigirCreator();
  const { aba } = await searchParams;
  const D = await carregarDadosCreator(creatorId, hojeSP());
  return <ProvedorDados D={D}><TelaCampanhasCreator creatorId={creatorId} aba={aba} /></ProvedorDados>;
}
