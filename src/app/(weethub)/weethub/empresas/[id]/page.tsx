// Ficha da empresa. Dono: M11.
import { exigirWeethub } from '@/lib/acesso';
import { TelaFichaEmpresa } from './tela';

export default async function FichaEmpresa({ params }: { params: Promise<{ id: string }> }) {
  await exigirWeethub();
  const { id } = await params;
  return <TelaFichaEmpresa id={id} />;
}
