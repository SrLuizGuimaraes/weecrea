'use client';
// Downloads gerados no navegador (CSV, texto e .zip). Dono: M1.
import JSZip from 'jszip';

export function baixarArquivo(nome: string, conteudo: BlobPart, tipo = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement('a');
  a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * .zip com os vídeos. Arquivos que o navegador consegue baixar entram como estão; os que não (links das redes,
 * arquivos de exemplo) entram como um atalho .url para abrir a publicação.
 */
export async function baixarZip(nome: string, itens: { nome: string; url: string }[], aoProgredir?: (n: number) => void) {
  const zip = new JSZip();
  let i = 0;
  for (const item of itens) {
    let ok = false;
    if (item.url.startsWith('blob:')) {
      try { const r = await fetch(item.url); if (r.ok) { zip.file(item.nome, await r.blob()); ok = true; } } catch { /* segue como atalho */ }
    }
    if (!ok) zip.file(item.nome.replace(/\.[a-z0-9]+$/i, '') + '.url', `[InternetShortcut]\r\nURL=${item.url}\r\n`);
    aoProgredir?.(++i);
  }
  baixarArquivo(nome, await zip.generateAsync({ type: 'blob' }), 'application/zip');
}
