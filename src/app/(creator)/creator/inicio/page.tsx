// Início do creator. Dono: M9.
import { exigirCreator } from '@/lib/acesso';
import { TelaInicio } from './tela';

export default async function InicioCreator({ searchParams }: { searchParams: Promise<{ loja?: string }> }) {
  const { creatorId, nome } = await exigirCreator();
  const { loja } = await searchParams;
  return <TelaInicio creatorId={creatorId} nome={nome} lojaId={loja} />;
}
