// Produtos e cupons. Dono: M3.
import { exigirLoja } from '@/lib/acesso';
import { TelaProdutos } from './tela';

export default async function ProdutosECupons({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba } = await searchParams;
  return <TelaProdutos lojaId={lojaId} aba={aba} />;
}
