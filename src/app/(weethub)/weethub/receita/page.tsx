// Receita da Weethub. Dono: M11.
import { exigirWeethub } from '@/lib/acesso';
import { TelaReceita } from './tela';

export default async function Receita() {
  await exigirWeethub();
  return <TelaReceita />;
}
