// CampanhasCreator do creator. Dono: M5.
import { exigirCreator } from '@/lib/acesso';
import { TelaCampanhasCreator } from './tela';

export default async function CampanhasCreator({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { creatorId } = await exigirCreator();
  const { aba } = await searchParams;
  return <TelaCampanhasCreator creatorId={creatorId} aba={aba} />;
}
