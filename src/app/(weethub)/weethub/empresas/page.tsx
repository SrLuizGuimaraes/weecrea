// Empresas. Dono: M11.
import { exigirWeethub } from '@/lib/acesso';
import { TelaEmpresas } from './tela';

export default async function Empresas() {
  await exigirWeethub();
  return <TelaEmpresas />;
}
