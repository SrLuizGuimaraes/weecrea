// Creators da base. Dono: M11.
import { exigirWeethub } from '@/lib/acesso';
import { TelaCreatorsBase } from './tela';

export default async function CreatorsDaBase({ searchParams }: { searchParams: Promise<{ uf?: string; status?: string; loja?: string; busca?: string }> }) {
  await exigirWeethub();
  return <TelaCreatorsBase f={await searchParams} />;
}
