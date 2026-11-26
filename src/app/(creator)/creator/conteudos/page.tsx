// Conteudos do creator. Dono: M8.
import { exigirCreator } from '@/lib/acesso';
import { TelaConteudos } from './tela';

export default async function Conteudos() {
  const { creatorId } = await exigirCreator();
  return <TelaConteudos creatorId={creatorId} />;
}
