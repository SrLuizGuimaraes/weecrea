'use client';
import { useState } from 'react';
import { enviarArquivo, type ArquivoEnviado } from '@/lib/upload-cliente';
import { lerVideo } from '@/lib/miniatura';

export function TesteUpload() {
  const [progresso, setProgresso] = useState<number | null>(null);
  const [resultado, setResultado] = useState<(ArquivoEnviado & { segundos: number; duracaoSeg?: number }) | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(arquivo: File) {
    setErro(null); setResultado(null); setProgresso(0);
    const inicio = performance.now();
    try {
      const info = arquivo.type.startsWith('video/') ? await lerVideo(arquivo).catch(() => null) : null;
      const r = await enviarArquivo(arquivo, 'testes', setProgresso);
      setResultado({ ...r, segundos: Math.round((performance.now() - inicio) / 1000), duracaoSeg: info?.duracaoSeg });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha no envio');
    } finally {
      setProgresso(null);
    }
  }

  return (
    <div className="space-y-3">
      <input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) void enviar(f); }} />
      {progresso !== null && (
        <div className="h-3 w-full overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuenow={progresso}>
          <div className="h-full bg-[var(--destaque)] transition-all" style={{ width: `${progresso}%` }} />
        </div>
      )}
      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
      {resultado && (
        <p className="break-all text-sm">
          Enviado: {(resultado.tamanhoBytes / 1024 ** 2).toFixed(1)} MB em {resultado.segundos}s
          {resultado.duracaoSeg !== undefined && `, vídeo de ${resultado.duracaoSeg}s`}.{' '}
          <a href={resultado.url} className="underline" target="_blank" rel="noreferrer">Abrir arquivo</a>
        </p>
      )}
    </div>
  );
}
