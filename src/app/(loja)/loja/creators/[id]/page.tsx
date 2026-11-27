// Perfil do creator na loja. Dono: M7.
import { exigirLoja } from '@/lib/acesso';
import { carregarDadosLoja } from '@/lib/dados-reais';
import { ProvedorDados } from '@/lib/dados-reais-cliente';
import { hojeSP } from '@/lib/datas';
import { TelaPerfilCreator } from './tela';

export default async function PerfilCreator({ params }: { params: Promise<{ id: string }> }) {
  const { lojaId } = await exigirLoja();
  const { id } = await params;
  const D = await carregarDadosLoja(lojaId, hojeSP());
  return <ProvedorDados D={D}><TelaPerfilCreator lojaId={lojaId} id={id} /></ProvedorDados>;
}
