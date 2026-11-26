// Biblioteca de vídeos da loja. Dono: M8. Dados de exemplo; aprovar, baixar e coleções só simulam.
import Link from 'next/link';
import { Download, FolderPlus, LayoutGrid, List, Upload } from 'lucide-react';
import { Botao, CabecalhoPagina, Cartao, CartaoVideo, Chip, EtiquetaStatus, Modal, Tabela, Td, Vazio } from '@/componentes';
import { AreaTexto, Campo, classeEntrada } from '@/componentes/campos';
import { BotaoEmBreve, FormSimulado } from '@/componentes/em-breve';
import { exigirLoja } from '@/lib/acesso';
import { formatarData } from '@/lib/datas';
import { formatarCompacto } from '@/lib/dados-exemplo';
import { bibliotecaDaLoja, type FiltroBiblioteca } from '@/modulos/m8-biblioteca/dados';

type Params = FiltroBiblioteca & { modo?: string };
const REDE = { instagram: 'Instagram', tiktok: 'TikTok' } as const;

export default async function Biblioteca({ searchParams }: { searchParams: Promise<Params> }) {
  const { lojaId } = await exigirLoja();
  const p = await searchParams;
  const modo = p.modo === 'lista' ? 'lista' : 'grade';
  const d = bibliotecaDaLoja(lojaId, p);
  const link = (extra: Partial<Params>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...p, ...extra })) if (v) q.set(k, String(v));
    return `/loja/biblioteca?${q}`;
  };
  return (
    <>
      <CabecalhoPagina titulo={d.colecao ? `Coleção: ${d.colecao.nome}` : 'Biblioteca'}
        descricao={d.colecao ? <Link href="/loja/biblioteca" className="underline">← Toda a biblioteca</Link> : `Vídeos dos creators, por campanha. ${d.pendentes} aguardando análise.`}
        acoes={<>
          <Modal titulo="Enviar vídeo recebido por fora" gatilho={<Botao variante="secundario"><Upload size={16} />Enviar vídeo</Botao>}>
            <FormSimulado mensagem="Vídeo enviado (simulação). O upload real usa o Vercel Blob." className="space-y-3">
              <Campo rotulo="Arquivo" type="file" accept="video/*" />
              <Campo rotulo="De quem é (opcional)" placeholder="Nome ou @perfil" />
              <div className="flex justify-end"><Botao type="submit">Enviar</Botao></div>
            </FormSimulado>
          </Modal>
          <Modal titulo="Nova coleção" gatilho={<Botao variante="secundario"><FolderPlus size={16} />Nova coleção</Botao>}>
            <FormSimulado mensagem="Coleção criada (simulação)." className="space-y-3">
              <Campo rotulo="Nome" placeholder="Melhores para anúncio" required />
              <div className="flex justify-end"><Botao type="submit">Criar</Botao></div>
            </FormSimulado>
          </Modal>
        </>} />

      {!!d.colecoes.length && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-suave">Coleções:</span>
          {d.colecoes.map((c) => <Chip key={c.id} href={`/loja/biblioteca?colecao=${c.id}`} ativo={p.colecao === c.id}>{c.nome} ({c.videoIds.length})</Chip>)}
        </div>
      )}

      <Cartao className="mb-4">
        <form method="get" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
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
        </form>
      </Cartao>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-suave">{d.videos.length} vídeo(s)</p>
        <div className="flex flex-wrap gap-2">
          <Chip href={link({ modo: 'grade' })} ativo={modo === 'grade'}><LayoutGrid size={14} />Grade</Chip>
          <Chip href={link({ modo: 'lista' })} ativo={modo === 'lista'}><List size={14} />Lista</Chip>
          <BotaoEmBreve variante="secundario" tamanho="p" mensagem="Selecionar todos (simulação).">Selecionar todos do filtro</BotaoEmBreve>
          <BotaoEmBreve tamanho="p" mensagem="Gerando o .zip dos vídeos selecionados (simulação)."><Download size={14} />Baixar .zip</BotaoEmBreve>
        </div>
      </div>

      {!d.videos.length ? <Vazio titulo="Nenhum vídeo com esses filtros" /> : modo === 'lista' ? (
        <Tabela colunas={['', 'Creator', 'Campanha', 'Rede', 'Status', 'Views', 'Enviado em', '']}>
          {d.videos.map(({ video: v, creator, campanha }) => (
            <tr key={v.id}>
              <Td><input type="checkbox" aria-label="Selecionar" className="size-4 accent-[var(--cor-destaque)]" /></Td>
              <Td className="font-medium">{creator}</Td><Td>{campanha}</Td><Td>{v.rede ? REDE[v.rede] : '—'} {v.formato && <span className="text-suave">· {v.formato}</span>}</Td>
              <Td><EtiquetaStatus status={v.status} />{v.motivoReprovacao && <div className="text-xs text-suave">{v.motivoReprovacao}</div>}</Td>
              <Td>{v.views ? formatarCompacto(v.views) : '—'}</Td><Td>{formatarData(v.enviadoEm)}</Td>
              <Td><AcoesVideo status={v.status} /></Td>
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
                  <CartaoVideo key={v.id} perfil={creator} rede={v.rede ? REDE[v.rede] : 'Arquivo'} formato={v.formato} status={v.status}
                    selecao={{ name: 'videoIds', value: v.id }} href={v.link ?? v.arquivoUrl} miniaturaUrl={v.miniaturaUrl}
                    rodape={<div className="space-y-1"><p className="text-suave">{v.views ? `${formatarCompacto(v.views)} views` : formatarData(v.enviadoEm)}</p><AcoesVideo status={v.status} /></div>} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function AcoesVideo({ status }: { status: string }) {
  if (status !== 'em_analise') return null;
  return (
    <div className="flex flex-wrap gap-1">
      <Modal titulo="Reprovar vídeo" gatilho={<Botao tamanho="p" variante="fantasma">Reprovar</Botao>}>
        <FormSimulado mensagem="Vídeo reprovado (simulação). O creator vê o motivo." className="space-y-3">
          <AreaTexto rotulo="Motivo (obrigatório)" required placeholder="O que precisa mudar" />
          <div className="flex justify-end"><Botao type="submit" variante="perigo">Reprovar</Botao></div>
        </FormSimulado>
      </Modal>
      <BotaoEmBreve tamanho="p" mensagem="Vídeo aprovado (simulação).">Aprovar</BotaoEmBreve>
    </div>
  );
}
