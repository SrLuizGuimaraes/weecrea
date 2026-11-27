// Ajudas de exibição para as telas (servidor e navegador). Dono: M1.

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

/** Identificador novo para itens criados na demonstração. */
let contador = 0;
export function novoId(prefixo: string) {
  contador += 1;
  return `${prefixo}-${Date.now().toString(36)}${contador}`;
}
