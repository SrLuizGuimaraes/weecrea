// Financeiro da loja. Dono: M10.
import { exigirLoja } from '@/lib/acesso';
import { TelaFinanceiroLoja } from './tela';

export default async function FinanceiroLoja({ searchParams }: { searchParams: Promise<{ aba?: string; p?: string }> }) {
  const { lojaId, id } = await exigirLoja();
  const { aba, p } = await searchParams;
  return <TelaFinanceiroLoja lojaId={lojaId} usuarioId={id} aba={aba} pagina={Number(p) || 1} />;
}
