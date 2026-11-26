// Configurações da loja. Donos: M6 (página de cadastro) e M7 (critérios).
import { exigirLoja } from '@/lib/acesso';
import { urlDoApp } from '@/lib/link-senha';
import { TelaConfiguracoes } from './tela';

export default async function Configuracoes({ searchParams }: { searchParams: Promise<{ aba?: string; campanha?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba, campanha } = await searchParams;
  return <TelaConfiguracoes lojaId={lojaId} aba={aba} campanha={campanha} urlApp={urlDoApp()} />;
}
