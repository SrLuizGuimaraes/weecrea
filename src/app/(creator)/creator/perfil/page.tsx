// Perfil do creator. Dono: M6 (protótipo).
import { exigirCreator } from '@/lib/acesso';
import { TelaPerfil } from './tela';

export default async function Perfil() {
  const { creatorId } = await exigirCreator();
  return <TelaPerfil creatorId={creatorId} />;
}
