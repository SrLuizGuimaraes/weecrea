// Painel Weethub. Dono: M11.
import { exigirWeethub } from '@/lib/acesso';
import { TelaPainelWeethub } from './tela';

export default async function PainelWeethub() {
  await exigirWeethub();
  return <TelaPainelWeethub />;
}
