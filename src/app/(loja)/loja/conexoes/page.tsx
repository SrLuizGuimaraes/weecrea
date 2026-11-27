// Conexões (M3) e pedidos recebidos (M4).
import { exigirLoja } from '@/lib/acesso';
import { TelaConexoes } from './tela';

export default async function Conexoes({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba } = await searchParams;
  return <TelaConexoes lojaId={lojaId} aba={aba} />;
}
