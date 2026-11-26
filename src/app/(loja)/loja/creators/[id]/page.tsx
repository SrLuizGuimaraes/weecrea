// Perfil do creator na loja. Dono: M7.
import { exigirLoja } from '@/lib/acesso';
import { TelaPerfilCreator } from './tela';

export default async function PerfilCreator({ params }: { params: Promise<{ id: string }> }) {
  const { lojaId } = await exigirLoja();
  const { id } = await params;
  return <TelaPerfilCreator lojaId={lojaId} id={id} />;
}
