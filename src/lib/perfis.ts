// Perfis e áreas. Dono: M1. Sem dependências de servidor: pode ser usado no proxy e nas telas.
import type { Perfil } from '@/contratos/tipos';

/** Página inicial de cada perfil depois do login. */
export const INICIO_DO_PERFIL: Record<Perfil, string> = {
  LOJA: '/loja/painel',
  CREATOR: '/creator/inicio',
  WEETHUB: '/weethub',
};

/** Prefixo de rota de cada área e quem pode abrir. */
export const AREAS: { prefixo: string; perfis: Perfil[] }[] = [
  { prefixo: '/loja', perfis: ['LOJA'] },
  { prefixo: '/creator', perfis: ['CREATOR'] },
  { prefixo: '/weethub', perfis: ['WEETHUB'] },
];

/** Rotas que exigem login mas servem a qualquer perfil. */
export const ROTAS_LOGADAS = ['/upload-teste'];

export function areaDaRota(caminho: string) {
  return AREAS.find((a) => caminho === a.prefixo || caminho.startsWith(`${a.prefixo}/`));
}

/** true se o perfil pode abrir o caminho. Rotas fora das áreas não são decididas aqui. */
export function perfilPodeAbrir(perfil: Perfil, caminho: string): boolean {
  const area = areaDaRota(caminho);
  return !area || area.perfis.includes(perfil);
}
