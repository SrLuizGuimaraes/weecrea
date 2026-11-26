// Dados da biblioteca de vídeos (M8). Hoje lê os dados de exemplo; depois, o banco.
import 'server-only';
import type { Video } from '@/contratos/tipos';
import { dados } from '@/lib/dados-exemplo';

export interface FiltroBiblioteca { campanha?: string; tag?: string; creator?: string; rede?: string; status?: string; busca?: string; colecao?: string }

export function bibliotecaDaLoja(lojaId: string, f: FiltroBiblioteca) {
  const daLoja = dados.videos.filter((v) => v.lojaId === lojaId);
  const colecao = f.colecao ? dados.colecoes.find((c) => c.id === f.colecao && c.lojaId === lojaId) : undefined;
  const nomeCreator = (v: Video) => dados.creators.find((c) => c.id === v.creatorId)?.nome ?? 'Enviado pela loja';
  const videos = daLoja.filter((v) =>
    (!colecao || colecao.videoIds.includes(v.id))
    && (!f.campanha || v.campanhaId === f.campanha)
    && (!f.tag || v.tags.includes(f.tag))
    && (!f.creator || v.creatorId === f.creator)
    && (!f.rede || v.rede === f.rede)
    && (!f.status || v.status === f.status)
    && (!f.busca || nomeCreator(v).toLowerCase().includes(f.busca.toLowerCase())))
    .sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm))
    .map((v) => ({ video: v, creator: nomeCreator(v), campanha: dados.campanhas.find((k) => k.id === v.campanhaId)?.nome ?? 'Sem campanha' }));

  const grupos = new Map<string, typeof videos>();
  for (const v of videos) grupos.set(v.campanha, [...(grupos.get(v.campanha) ?? []), v]);

  return {
    videos, grupos: [...grupos],
    opcoes: {
      campanhas: dados.campanhas.filter((k) => k.lojaId === lojaId && daLoja.some((v) => v.campanhaId === k.id)),
      tags: [...new Set(daLoja.flatMap((v) => v.tags))].sort(),
      creators: [...new Set(daLoja.map((v) => v.creatorId).filter(Boolean))].map((id) => dados.creators.find((c) => c.id === id)!).filter(Boolean),
    },
    colecoes: dados.colecoes.filter((c) => c.lojaId === lojaId),
    colecao,
    pendentes: daLoja.filter((v) => v.status === 'em_analise').length,
  };
}

/** Conteúdos do creator: vídeos enviados e campanhas aceitas para enviar mais. */
export function conteudosDoCreator(creatorId: string) {
  const videos = dados.videos.filter((v) => v.creatorId === creatorId).sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm))
    .map((v) => ({ video: v, campanha: dados.campanhas.find((k) => k.id === v.campanhaId), loja: dados.lojas.find((l) => l.id === v.lojaId)! }));
  const campanhasAceitas = dados.participacoes.filter((p) => p.creatorId === creatorId && p.status === 'aceito')
    .map((p) => dados.campanhas.find((k) => k.id === p.campanhaId)!).filter((k) => k && k.status === 'ativa');
  return { videos, campanhasAceitas };
}
