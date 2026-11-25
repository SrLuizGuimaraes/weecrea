// Pastas de upload e limites. Dono: M1. Sem dependências de servidor: usado no navegador e na rota.

export const PASTAS_UPLOAD = {
  videos: { tipos: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'], maxBytes: 2 * 1024 ** 3 }, // 2 GB
  miniaturas: { tipos: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: 10 * 1024 ** 2 },
  fotos: { tipos: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: 10 * 1024 ** 2 },
  comprovantes: { tipos: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], maxBytes: 20 * 1024 ** 2 },
  testes: { tipos: ['video/*', 'image/*', 'application/octet-stream', 'application/zip'], maxBytes: 2 * 1024 ** 3 },
} as const;

export type PastaUpload = keyof typeof PASTAS_UPLOAD;

export function pastaDoCaminho(caminho: string): PastaUpload | undefined {
  const pasta = caminho.split('/')[0];
  return pasta && pasta in PASTAS_UPLOAD ? (pasta as PastaUpload) : undefined;
}

/** Nome de arquivo seguro para o caminho no Blob. */
export function nomeSeguro(nome: string): string {
  const limpo = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return limpo.slice(-80) || 'arquivo';
}
