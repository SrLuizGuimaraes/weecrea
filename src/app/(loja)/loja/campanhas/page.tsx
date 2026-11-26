// Campanhas da loja. Dono: M5.
import { exigirLoja } from '@/lib/acesso';
import { TelaCampanhas } from './tela';

export default async function Campanhas({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba } = await searchParams;
  return <TelaCampanhas lojaId={lojaId} aba={aba} />;
}
