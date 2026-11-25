// Miniatura e duração do vídeo, tiradas no navegador no momento do upload. Dono: M1.
// Use em componentes 'use client':
//   const { miniatura, duracaoSeg } = await lerVideo(arquivo);
//   const capa = await enviarArquivo(miniatura, 'miniaturas', undefined, 'capa.jpg');

export async function lerVideo(arquivo: File, segundo = 1): Promise<{ miniatura: Blob; duracaoSeg: number; largura: number; altura: number }> {
  const url = URL.createObjectURL(arquivo);
  try {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    await new Promise<void>((ok, erro) => {
      video.onloadedmetadata = () => ok();
      video.onerror = () => erro(new Error('Não foi possível ler este vídeo.'));
    });
    const duracaoSeg = Math.round(video.duration || 0);
    video.currentTime = Math.min(segundo, Math.max(0, (video.duration || 0) / 2));
    await new Promise<void>((ok) => { video.onseeked = () => ok(); });
    const largura = video.videoWidth;
    const altura = video.videoHeight;
    const escala = Math.min(1, 720 / Math.max(largura, altura));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(largura * escala);
    canvas.height = Math.round(altura * escala);
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const miniatura = await new Promise<Blob>((ok, erro) =>
      canvas.toBlob((b) => (b ? ok(b) : erro(new Error('Falha ao gerar a miniatura.'))), 'image/jpeg', 0.8));
    return { miniatura, duracaoSeg, largura, altura };
  } finally {
    URL.revokeObjectURL(url);
  }
}
