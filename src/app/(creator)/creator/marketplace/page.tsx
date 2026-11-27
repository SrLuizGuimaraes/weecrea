// Marketplace do creator. Dono: M6 (protótipo).
import { exigirCreator } from '@/lib/acesso';
import { TelaMarketplace } from './tela';

export default async function Marketplace({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { creatorId } = await exigirCreator();
  const { aba } = await searchParams;
  return <TelaMarketplace creatorId={creatorId} aba={aba} />;
}
