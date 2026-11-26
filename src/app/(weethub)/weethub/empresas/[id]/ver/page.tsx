// "Ver como cliente". Dono: M11.
import { exigirWeethub } from '@/lib/acesso';
import type { ParamsPainel } from '@/modulos/m9-painel/painel-loja';
import { TelaVerComoCliente } from './tela';

export default async function VerComoCliente({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<ParamsPainel & { tela?: string; aba?: string; p?: string }> }) {
  const { id: usuarioId } = await exigirWeethub();
  const { id } = await params;
  return <TelaVerComoCliente id={id} usuarioId={usuarioId} params={await searchParams} />;
}
