'use client';
// Biblioteca de vídeos da loja. Dono: M8. Estado da demonstração: aprovar, reprovar, coleções, .zip e envio funcionam sem gravar.
import Link from 'next/link';
import Form from 'next/form';
import { Download, FolderPlus, LayoutGrid, List, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { AreaTexto, Botao, CabecalhoPagina, Campo, Cartao, CartaoVideo, Chip, EtiquetaStatus, Modal, Selecao, Tabela, Td, Vazio } from '@/componentes';
import { classeEntrada } from '@/componentes/campos';
import { useToast } from '@/componentes/toast';
import type { Video } from '@/contratos/tipos';
import { formatarData } from '@/lib/datas';
import { baixarZip } from '@/lib/demo/baixar';
import { useDemo } from '@/lib/demo/estado';
import { formatarCompacto } from '@/lib/demo/util';
import { lerVideo } from '@/lib/miniatura';
import { adicionarNaColecao, aprovarVideos, criarColecao, enviarVideo, removerDaColecao, reprovarVideo } from '@/modulos/m8-biblioteca/acoes';
import { bibliotecaDaLoja, type FiltroBiblioteca } from '@/modulos/m8-biblioteca/dados';

export type ParamsBiblioteca = FiltroBiblioteca & { modo?: string };
const REDE = { instagram: 'Instagram', tiktok: 'TikTok' } as const;

export function TelaBiblioteca({ lojaId, p }: { lojaId: string; p: ParamsBiblioteca }) {
  const { D, mudar } = useDemo();
  const toast = useToast();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [zipando, setZipando] = useState<string | null>(null);
  const modo = p.modo === 'lista' ? 'lista' : 'grade';
  const d = bibliotecaDaLoja(D, lojaId, p);
  const visiveis = d.videos.map((v) => v.video.id);
  const selecionados = [...sel].filter((id) => visiveis.includes(id));
  const alternar = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const link = (extra: Partial<ParamsBiblioteca>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...p, ...extra })) if (v) q.set(k, String(v));
    return `/loja/biblioteca?${q}`;
  };

  async function baixar(ids: string[]) {
    const itens = d.videos.filter((v) => ids.includes(v.video.id)).map(({ video: v, creator }, i) => ({
      nome: `${String(i + 1).padStart(2, '0')}-${creator.replace(/[^\p{L}\p{N}]+/gu, '-')}-${v.id}.mp4`, url: v.arquivoUrl ?? v.link ?? '',
    })).filter((x) => x.url);
    if (!itens.length) return toast('Selecione ao menos um vídeo.', 'perigo');
    setZipando(`0/${itens.length}`);
    try { await baixarZip(`videos-${new Date().toISOString().slice(0, 10)}.zip`, itens, (n) => setZipando(`${n}/${itens.length}`)); toast(`${itens.length} vídeo(s) no .zip`); }
    finally { setZipando(null); }
  }

  return (
    <>
      <CabecalhoPagina titulo={d.colecao ? `Coleção: ${d.colecao.nome}` : 'Biblioteca'}
        descricao={d.colecao ? <Link href="/loja/biblioteca" className="underline">← Toda a biblioteca</Link> : `Vídeos dos creators, por campanha. ${d.pendentes} aguardando análise.`}
        acoes={<>
          <EnviarVideoLoja lojaId={lojaId} />
          <Modal titulo="Nova coleção" gatilho={<Botao variante="secundario"><FolderPlus size={16} />Nova coleção</Botao>}>
            {(fechar) => (
              <form className="space-y-3" onSubmit={(e) => {
                e.preventDefault();
                const nome = String(new FormData(e.currentTarget).get('nome'));
                if (mudar((dd) => { criarColecao(dd, lojaId, nome, selecionados); }, `Coleção criada${selecionados.length ? ` com ${selecionados.length} vídeo(s)` : ''}`)) fechar();
              }}>
                <Campo rotulo="Nome" name="nome" placeholder="Melhores para anúncio" required />
                {!!selecionados.length && <p className="text-sm text-suave">Os {selecionados.length} vídeo(s) selecionados entram na coleção.</p>}
                <div className="flex justify-end"><Botao type="submit">Criar</Botao></div>
              </form>
            )}
          </Modal>
        </>} />

      {!!d.colecoes.length && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-suave">Coleções:</span>
          {d.colecoes.map((c) => <Chip key={c.id} href={`/loja/biblioteca?colecao=${c.id}`} ativo={p.colecao === c.id}>{c.nome} ({c.videoIds.length})</Chip>)}
        </div>
      )}

      <Cartao className="mb-4">
        <Form action="/loja/biblioteca" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <input type="hidden" name="modo" value={modo} />
          {p.colecao && <input type="hidden" name="colecao" value={p.colecao} />}
          <select name="campanha" defaultValue={p.campanha ?? ''} className={classeEntrada} aria-label="Campanha">
            <option value="">Todas as campanhas</option>{d.opcoes.campanhas.map((k) => <option key={k.id} value={k.id}>{k.nome}</option>)}
          </select>
          <select name="tag" defaultValue={p.tag ?? ''} className={classeEntrada} aria-label="Tag">
            <option value="">Todas as tags</option>{d.opcoes.tags.map((t) => <option key={t} value={t}>#{t}</option>)}
          </select>
          <select name="creator" defaultValue={p.creator ?? ''} className={classeEntrada} aria-label="Creator">
            <option value="">Todos os creators</option>{d.opcoes.creators.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select name="rede" defaultValue={p.rede ?? ''} className={classeEntrada} aria-label="Rede">
            <option value="">Todas as redes</option><option value="instagram">Instagram</option><option value="tiktok">TikTok</option>
          </select>
          <select name="status" defaultValue={p.status ?? ''} className={classeEntrada} aria-label="Status">
            <option value="">Todos os status</option><option value="em_analise">Em análise</option><option value="aprovado">Aprovado</option><option value="reprovado">Reprovado</option>
          </select>
          <div className="flex gap-2">
            <input name="busca" defaultValue={p.busca} placeholder="Buscar creator" className={classeEntrada} />
            <Botao type="submit">Filtrar</Botao>
          </div>
        </Form>
      </Cartao>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-cartao border border-borda bg-superficie px-3 py-2">
        <p className="text-sm text-suave">{d.videos.length} vídeo(s){selecionados.length ? ` · ${selecionados.length} selecionado(s)` : ''}</p>
        <div className="flex flex-wrap gap-2">
          <Chip href={link({ modo: 'grade' })} ativo={modo === 'grade'}><LayoutGrid size={14} />Grade</Chip>
          <Chip href={link({ modo: 'lista' })} ativo={modo === 'lista'}><List size={14} />Lista</Chip>
          <Botao variante="secundario" tamanho="p" onClick={() => setSel(selecionados.length === visiveis.length ? new Set() : new Set(visiveis))}>
            {selecionados.length === visiveis.length && visiveis.length ? 'Limpar seleção' : 'Selecionar todos do filtro'}
          </Botao>
          {!!selecionados.length && <>
            <Botao tamanho="p" variante="secundario" onClick={() => { let n = 0; mudar((dd) => { n = aprovarVideos(dd, lojaId, selecionados); }); toast(`${n} vídeo(s) aprovado(s)`); }}>Aprovar selecionados</Botao>
            {!!d.colecoes.length && (
              <select aria-label="Adicionar à coleção" className="h-8 rounded-controle border border-borda bg-superficie px-2 text-xs" value="" onChange={(e) => {
                const id = e.target.value; if (!id) return;
                let n = 0; if (mudar((dd) => { n = adicionarNaColecao(dd, lojaId, id, selecionados); })) toast(`${n} vídeo(s) adicionado(s) à coleção`);
              }}>
                <option value="">Adicionar à coleção…</option>{d.colecoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            )}
          </>}
          <Botao tamanho="p" disabled={!!zipando} onClick={() => void baixar(selecionados.length ? selecionados : visiveis)}>
            <Download size={14} />{zipando ? `Gerando ${zipando}` : selecionados.length ? `Baixar ${selecionados.length} em .zip` : 'Baixar todos em .zip'}
          </Botao>
        </div>
      </div>

      {!d.videos.length ? <Vazio titulo="Nenhum vídeo com esses filtros" /> : modo === 'lista' ? (
        <Tabela colunas={['', 'Creator', 'Campanha', 'Rede', 'Status', 'Views', 'Enviado em', '']}>
          {d.videos.map(({ video: v, creator, campanha }) => (
            <tr key={v.id}>
              <Td><input type="checkbox" aria-label="Selecionar" checked={sel.has(v.id)} onChange={() => alternar(v.id)} className="size-4 accent-[var(--cor-texto)]" /></Td>
              <Td className="font-medium">{creator}</Td><Td>{campanha}</Td><Td>{v.rede ? REDE[v.rede] : 'Arquivo'} {v.formato && <span className="text-suave">· {v.formato}</span>}</Td>
              <Td><EtiquetaStatus status={v.status} />{v.motivoReprovacao && <div className="text-xs text-suave">{v.motivoReprovacao}</div>}</Td>
              <Td>{v.views ? formatarCompacto(v.views) : '—'}</Td><Td>{formatarData(v.enviadoEm)}</Td>
              <Td><AcoesVideo lojaId={lojaId} video={v} colecaoId={d.colecao?.id} /></Td>
            </tr>
          ))}
        </Tabela>
      ) : (
        <div className="space-y-6">
          {d.grupos.map(([campanha, lista]) => (
            <section key={campanha}>
              <h2 className="mb-2 text-sm font-semibold">{campanha} <span className="font-normal text-suave">({lista.length})</span></h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {lista.map(({ video: v, creator }) => (
                  <div key={v.id} className="relative">
                    <CartaoVideo perfil={creator} rede={v.rede ? REDE[v.rede] : 'Arquivo'} formato={v.formato} status={v.status}
                      href={v.link ?? v.arquivoUrl} miniaturaUrl={v.miniaturaUrl}
                      rodape={<div className="space-y-1"><p className="text-suave">{v.views ? `${formatarCompacto(v.views)} views` : formatarData(v.enviadoEm)}</p><AcoesVideo lojaId={lojaId} video={v} colecaoId={d.colecao?.id} /></div>} />
                    <label className="absolute left-2 top-2 z-20 rounded-md bg-black/50 p-1">
                      <input type="checkbox" aria-label="Selecionar vídeo" checked={sel.has(v.id)} onChange={() => alternar(v.id)} className="size-4 accent-white" />
                    </label>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function AcoesVideo({ lojaId, video: v, colecaoId }: { lojaId: string; video: Video; colecaoId?: string }) {
  const { mudar } = useDemo();
  return (
    <div className="flex flex-wrap gap-1">
      {colecaoId && <Botao tamanho="p" variante="fantasma" aria-label="Tirar da coleção" onClick={() => mudar((d) => removerDaColecao(d, lojaId, colecaoId, v.id), 'Tirado da coleção')}><X size={14} /></Botao>}
      {v.status !== 'reprovado' && (
        <Modal titulo="Reprovar vídeo" gatilho={<Botao tamanho="p" variante="fantasma">Reprovar</Botao>}>
          {(fechar) => (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (mudar((d) => reprovarVideo(d, lojaId, v.id, String(new FormData(e.currentTarget).get('motivo'))), 'Vídeo reprovado. O creator vê o motivo.')) fechar(); }}>
              <AreaTexto rotulo="Motivo (obrigatório)" name="motivo" required placeholder="O que precisa mudar" />
              <div className="flex justify-end"><Botao type="submit" variante="perigo">Reprovar</Botao></div>
            </form>
          )}
        </Modal>
      )}
      {v.status !== 'aprovado' && <Botao tamanho="p" onClick={() => mudar((d) => { aprovarVideos(d, lojaId, [v.id]); }, 'Vídeo aprovado')}>Aprovar</Botao>}
    </div>
  );
}

function EnviarVideoLoja({ lojaId }: { lojaId: string }) {
  const { D, mudar } = useDemo();
  const toast = useToast();
  const [lendo, setLendo] = useState(false);
  const campanhas = D.campanhas.filter((k) => k.lojaId === lojaId && k.status !== 'rascunho');
  return (
    <Modal titulo="Enviar vídeo recebido por fora" gatilho={<Botao variante="secundario"><Upload size={16} />Enviar vídeo</Botao>}>
      {(fechar) => (
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const arquivo = f.get('arquivo') as File | null;
          if (!arquivo || !arquivo.size) return toast('Escolha o arquivo do vídeo.', 'perigo');
          setLendo(true);
          const info = await lerVideo(arquivo).catch(() => null);
          setLendo(false);
          const ok = mudar((d) => {
            enviarVideo(d, {
              lojaId, origem: 'upload_loja', arquivoUrl: URL.createObjectURL(arquivo), tamanhoBytes: arquivo.size,
              ...(info ? { miniaturaUrl: URL.createObjectURL(info.miniatura), duracaoSeg: info.duracaoSeg } : {}),
              ...(f.get('campanhaId') ? { campanhaId: String(f.get('campanhaId')) } : {}),
            });
          }, 'Vídeo adicionado à biblioteca (só nesta sessão)');
          if (ok) fechar();
        }}>
          <Campo rotulo="Arquivo" name="arquivo" type="file" accept="video/*" required ajuda="Fica só no seu navegador durante a demonstração." />
          <Selecao rotulo="Campanha (opcional)" name="campanhaId" defaultValue=""><option value="">Sem campanha</option>{campanhas.map((k) => <option key={k.id} value={k.id}>{k.nome}</option>)}</Selecao>
          <div className="flex justify-end"><Botao type="submit" disabled={lendo}>{lendo ? 'Lendo o vídeo…' : 'Enviar'}</Botao></div>
        </form>
      )}
    </Modal>
  );
}
