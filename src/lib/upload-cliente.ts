// Upload direto do navegador para o Vercel Blob. Dono: M1.
// Use em componentes 'use client':
//
//   const { url } = await enviarArquivo(arquivo, 'videos', (pct) => setProgresso(pct));
//
// Arquivos grandes (vídeos de centenas de MB) vão em partes, com novas tentativas automáticas.
import { upload } from '@vercel/blob/client';
import { PASTAS_UPLOAD, nomeSeguro, type PastaUpload } from './blob-config';

export interface ArquivoEnviado { url: string; caminho: string; tamanhoBytes: number; tipo: string }

const LIMITE_PARTES = 20 * 1024 * 1024; // acima de 20 MB, envia em partes

export async function enviarArquivo(
  arquivo: File | Blob, pasta: PastaUpload, aoProgredir?: (percentual: number) => void, nome?: string,
): Promise<ArquivoEnviado> {
  const { maxBytes } = PASTAS_UPLOAD[pasta];
  if (arquivo.size > maxBytes) {
    throw new Error(`Arquivo maior que o limite de ${Math.round(maxBytes / 1024 ** 2)} MB.`);
  }
  const nomeArquivo = nomeSeguro(nome ?? (arquivo instanceof File ? arquivo.name : 'arquivo'));
  const blob = await upload(`${pasta}/${nomeArquivo}`, arquivo, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    multipart: arquivo.size > LIMITE_PARTES,
    contentType: arquivo.type || undefined,
    onUploadProgress: aoProgredir ? (p) => aoProgredir(Math.round(p.percentage)) : undefined,
  });
  return { url: blob.url, caminho: blob.pathname, tamanhoBytes: arquivo.size, tipo: blob.contentType };
}
