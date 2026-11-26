// Página pública de cadastro. Dono: M6.
import type { Metadata } from 'next';
import { dados } from '@/lib/dados-exemplo';
import { TelaCadastro } from './tela';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ campanha?: string; origem?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const loja = dados.lojas.find((l) => l.slug === slug);
  return { title: loja ? `${loja.paginaCadastro.titulo} · ${loja.nome}` : 'Cadastro de creators · WEECREA' };
}

export default async function PaginaCadastro({ params, searchParams }: Props) {
  const { slug } = await params;
  const { campanha, origem } = await searchParams;
  const o = origem === 'qr_code' || origem === 'link' || origem === 'email' ? origem : 'pagina';
  return <TelaCadastro slug={slug} campanhaId={campanha} origem={o} />;
}
