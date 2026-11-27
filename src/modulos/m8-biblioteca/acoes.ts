// Ações da biblioteca de vídeos (M8). Mudam os dados recebidos (D); hoje em memória, depois no banco.
import type { Video } from '@/contratos/tipos';
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { novoId } from '@/lib/demo/util';

export function aprovarVideos(D: DadosExemplo, lojaId: string, ids: string[]): number {
  let n = 0;
  for (const v of D.videos) if (v.lojaId === lojaId && ids.includes(v.id) && v.status !== 'aprovado') { v.status = 'aprovado'; delete v.motivoReprovacao; n += 1; }
  return n;
}

export function reprovarVideo(D: DadosExemplo, lojaId: string, id: string, motivo: string) {
  if (!motivo.trim()) throw new Error('O motivo da reprovação é obrigatório.');
  const v = D.videos.find((x) => x.id === id && x.lojaId === lojaId);
  if (!v) throw new Error('Vídeo não encontrado.');
  v.status = 'reprovado'; v.motivoReprovacao = motivo.trim();
}

export function criarColecao(D: DadosExemplo, lojaId: string, nome: string, videoIds: string[] = []): string {
  if (!nome.trim()) throw new Error('Dê um nome para a coleção.');
  const id = novoId('col');
  D.colecoes.push({ id, lojaId, nome: nome.trim(), videoIds });
  return id;
}

export function adicionarNaColecao(D: DadosExemplo, lojaId: string, colecaoId: string, videoIds: string[]): number {
  const c = D.colecoes.find((x) => x.id === colecaoId && x.lojaId === lojaId);
  if (!c) throw new Error('Coleção não encontrada.');
  const novos = videoIds.filter((id) => !c.videoIds.includes(id));
  c.videoIds.push(...novos);
  return novos.length;
}

export function removerDaColecao(D: DadosExemplo, lojaId: string, colecaoId: string, videoId: string) {
  const c = D.colecoes.find((x) => x.id === colecaoId && x.lojaId === lojaId);
  if (c) c.videoIds = c.videoIds.filter((id) => id !== videoId);
}

export type NovoVideo = Pick<Video, 'lojaId' | 'origem'> & Partial<Pick<Video, 'campanhaId' | 'creatorId' | 'rede' | 'formato' | 'link' | 'arquivoUrl' | 'miniaturaUrl' | 'duracaoSeg' | 'tamanhoBytes'>>;

/** Envio pelo creator (entra em análise) ou pela loja (já aprovado). */
export function enviarVideo(D: DadosExemplo, v: NovoVideo): string {
  if (!v.link && !v.arquivoUrl) throw new Error('Envie o link da publicação ou o arquivo do vídeo.');
  if (v.link && !/^https?:\/\/(www\.)?(instagram\.com|tiktok\.com)\//i.test(v.link)) throw new Error('O link precisa ser do Instagram ou do TikTok.');
  const k = v.campanhaId ? D.campanhas.find((c) => c.id === v.campanhaId) : undefined;
  const id = novoId('v');
  D.videos.push({
    ...v, id, tags: k?.tags ?? [], status: v.origem === 'creator' ? 'em_analise' : 'aprovado',
    direito: k && k.entrega !== 'publicar' ? 'organico_e_anuncio' : 'organico', enviadoEm: new Date().toISOString(),
  });
  return id;
}

export function atualizarMetricas(D: DadosExemplo, creatorId: string, videoId: string, m: { views?: number; curtidas?: number; comentarios?: number }) {
  const v = D.videos.find((x) => x.id === videoId && x.creatorId === creatorId);
  if (!v) throw new Error('Vídeo não encontrado.');
  Object.assign(v, m);
}
