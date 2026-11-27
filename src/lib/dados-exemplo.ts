// Dados de exemplo (mockup) para as telas enquanto os módulos reais não ficam prontos. Dono: M1.
// Cada módulo lê daqui pelas funções em src/modulos/mX-*/dados.ts. Para trocar pelo real,
// só essas funções mudam (passam a ler do banco com src/lib/db.ts); as telas continuam iguais.
import 'server-only';
import bruto from '../../dados-exemplo/dados.json';
import type { DadosExemplo } from '../../dados-exemplo/gerar';

export const dados = bruto as unknown as DadosExemplo;

/** "Hoje" dos dados de exemplo (para os números baterem sempre do mesmo jeito). */
export const HOJE_EXEMPLO = dados.hoje;

export function lojaPorId(id: string) {
  return dados.lojas.find((l) => l.id === id);
}

export function creatorPorId(id: string) {
  return dados.creators.find((c) => c.id === id);
}

export function campanhaPorId(id: string) {
  return dados.campanhas.find((k) => k.id === id);
}

export function produtoPorId(id: string) {
  return dados.produtos.find((p) => p.id === id);
}

/** Perfil principal do creator para mostrar: @arroba da rede com mais seguidores. */
export function perfilPrincipal(c: { instagram?: { perfil: string; seguidores: number }; tiktok?: { perfil: string; seguidores: number } }) {
  const ig = c.instagram?.seguidores ?? -1;
  const tt = c.tiktok?.seguidores ?? -1;
  if (ig < 0 && tt < 0) return { rede: '—', perfil: '—', seguidores: 0 };
  return ig >= tt
    ? { rede: 'Instagram', perfil: `@${c.instagram!.perfil}`, seguidores: ig }
    : { rede: 'TikTok', perfil: `@${c.tiktok!.perfil}`, seguidores: tt };
}

export const formatarNumero = (n: number) => new Intl.NumberFormat('pt-BR').format(n);
export const formatarCompacto = (n: number) => new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
