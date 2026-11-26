// Financeiro do creator. Dono: M10.
import { exigirCreator } from '@/lib/acesso';
import { TelaFinanceiroCreator } from './tela';

export default async function FinanceiroCreator({ searchParams }: { searchParams: Promise<{ aba?: string; p?: string }> }) {
  const { creatorId } = await exigirCreator();
  const { aba, p } = await searchParams;
  return <TelaFinanceiroCreator creatorId={creatorId} aba={aba} p={p} />;
}
