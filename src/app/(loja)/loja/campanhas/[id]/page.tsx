// Detalhe da campanha. Dono: M5.
import { exigirLoja } from '@/lib/acesso';
import { TelaDetalheCampanha } from './tela';

export default async function DetalheCampanha({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { id } = await params;
  const { aba } = await searchParams;
  return <TelaDetalheCampanha lojaId={lojaId} id={id} aba={aba} />;
}
