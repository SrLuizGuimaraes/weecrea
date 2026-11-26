// Creators da loja. Dono: M7.
import { exigirLoja } from '@/lib/acesso';
import { TelaCreators } from './tela';

export default async function Creators({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba } = await searchParams;
  return <TelaCreators lojaId={lojaId} aba={aba} />;
}
