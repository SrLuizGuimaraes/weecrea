// Página pública de cadastro. Dono: M6.
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { carregarDadosPublicos } from '@/lib/dados-reais';
import { ProvedorDados } from '@/lib/dados-reais-cliente';
import { hojeSP } from '@/lib/datas';
import { TelaCadastro } from './tela';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ campanha?: string; origem?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const loja = await db.loja.findUnique({ where: { slug }, select: { nome: true, paginaTitulo: true } });
  return { title: loja ? `${loja.paginaTitulo} · ${loja.nome}` : 'Cadastro de creators · WEECREA' };
}

export default async function PaginaCadastro({ params, searchParams }: Props) {
  const { slug } = await params;
  const { campanha, origem } = await searchParams;
  const o = origem === 'qr_code' || origem === 'link' || origem === 'email' ? origem : 'pagina';
  const D = await carregarDadosPublicos(slug, hojeSP(), campanha);
  return <ProvedorDados D={D}><TelaCadastro slug={slug} campanhaId={campanha} origem={o} /></ProvedorDados>;
}
