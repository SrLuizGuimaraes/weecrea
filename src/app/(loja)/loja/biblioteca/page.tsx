// Biblioteca de vídeos da loja. Dono: M8.
import { exigirLoja } from '@/lib/acesso';
import { TelaBiblioteca, type ParamsBiblioteca } from './tela';

export default async function Biblioteca({ searchParams }: { searchParams: Promise<ParamsBiblioteca> }) {
  const { lojaId } = await exigirLoja();
  return <TelaBiblioteca lojaId={lojaId} p={await searchParams} />;
}
