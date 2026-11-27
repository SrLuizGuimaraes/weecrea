'use client';
// Detalhe da campanha: participantes, ranking, vídeos, briefing, convite e cancelamento. Dono: M5.
import Link from 'next/link';
import { Ban, Pencil, UserPlus } from 'lucide-react';
import { Abas, Aviso, Botao, BotaoLink, CabecalhoPagina, CaixaSelecao, Cartao, CartaoIndicador, CartaoVideo, Etiqueta, EtiquetaStatus, Modal, Pessoa, Tabela, Td, Vazio } from '@/componentes';
import { BarraProgresso } from '@/componentes/progresso';
import { bpsParaTexto, formatarReais } from '@/dominio/dinheiro';
import { formatarData } from '@/lib/datas';
import { useDados } from '@/lib/dados-reais-cliente';
import { cancelarCampanhaServidor, convidarCreatorsServidor } from '@/modulos/m5-campanhas/servidor';
import { campanhaDaLoja } from '@/modulos/m5-campanhas/dados';

const ENTREGA = { publicar: 'Publicar nas redes', entregar_arquivo: 'Entregar o arquivo', publicar_e_entregar: 'Publicar e entregar o arquivo' };

export function TelaDetalheCampanha({ lojaId, id, aba = 'participantes' }: { lojaId: string; id: string; aba?: string }) {
  const { D, executar } = useDados();
  const d = campanhaDaLoja(D, lojaId, id);
  if (!d) return <Aviso tom="perigo">Campanha não encontrada. <Link href="/loja/campanhas" className="underline">Voltar</Link></Aviso>;
  const k = d.campanha;
  return (
    <>
      <CabecalhoPagina titulo={k.nome} voltar={<Link href="/loja/campanhas">← Campanhas</Link>}
        descricao={<>{formatarData(k.inicio)} a {formatarData(k.fim)} · {bpsParaTexto(k.comissaoBps)} de comissão · {ENTREGA[k.entrega]}</>}
        acoes={<>
          <EtiquetaStatus status={k.status} />
          {k.status !== 'encerrada' && k.status !== 'cancelada' && (
            <Modal titulo="Convidar creators aprovados" gatilho={<Botao variante="secundario"><UserPlus size={16} />Convidar</Botao>}>
              {(fechar) => (
                <form className="space-y-3" onSubmit={async (e) => {
                  e.preventDefault();
                  const ids = new FormData(e.currentTarget).getAll('creatorIds').map(String);
                  if (!ids.length) return;
                  if (await executar(() => convidarCreatorsServidor(k.id, ids), `${ids.length} convite(s) enviado(s)`)) fechar();
                }}>
                  {d.convidaveis.length ? d.convidaveis.map((c) => <CaixaSelecao key={c.id} name="creatorIds" value={c.id} rotulo={c.nome} className="flex" />)
                    : <p className="text-sm text-suave">Todos os creators aprovados já estão na campanha.</p>}
                  <p className="text-xs text-suave">Cada convidado vê a campanha na área dele.</p>
                  <div className="flex justify-end"><Botao type="submit" disabled={!d.convidaveis.length}>Enviar convites</Botao></div>
                </form>
              )}
            </Modal>
          )}
          {k.status !== 'encerrada' && k.status !== 'cancelada' && (
            <Modal titulo="Cancelar campanha" gatilho={<Botao variante="fantasma"><Ban size={16} />Cancelar</Botao>}>
              {(fechar) => (
                <div className="space-y-3 text-sm">
                  <p>Os creators deixam de ver a campanha e as vendas novas não entram nela. As comissões já geradas continuam.</p>
                  <div className="flex justify-end gap-2">
                    <Botao variante="fantasma" onClick={fechar}>Voltar</Botao>
                    <Botao variante="perigo" onClick={async () => { if (await executar(() => cancelarCampanhaServidor(k.id), 'Campanha cancelada')) fechar(); }}>Cancelar campanha</Botao>
                  </div>
                </div>
              )}
            </Modal>
          )}
          <BotaoLink href={`/loja/campanhas/${k.id}/editar`}><Pencil size={16} />Editar</BotaoLink>
        </>} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-cartao border border-borda bg-superficie p-4 sm:col-span-2">
          <p className="text-xs text-suave">Meta geral</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{formatarReais(d.realizado)}</p>
          <BarraProgresso className="mt-2" valor={d.realizado} total={k.metaCentavos} legenda={`de ${formatarReais(k.metaCentavos)}`} />
        </div>
        <CartaoIndicador rotulo="Participando" valor={d.participantes.filter((p) => p.participacao.status === 'aceito').length}
          detalhe={`${d.participantes.filter((p) => p.participacao.status === 'convidado').length} convite(s) pendente(s)`} />
        <CartaoIndicador rotulo="Pedidos" valor={d.pedidos} detalhe={`${d.videos.length} vídeos`} />
      </div>

      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'participantes', rotulo: 'Participantes e ranking', href: '?aba=participantes' },
        { chave: 'videos', rotulo: `Vídeos (${d.videos.length})`, href: '?aba=videos' },
        { chave: 'briefing', rotulo: 'Briefing e produtos', href: '?aba=briefing' },
      ]} /></div>

      {aba === 'videos' ? (
        d.videos.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {d.videos.map(({ video: v, creator }) => (
              <CartaoVideo key={v.id} perfil={creator?.nome ?? 'Loja'} rede={v.rede === 'tiktok' ? 'TikTok' : v.rede === 'instagram' ? 'Instagram' : undefined}
                formato={v.formato} status={v.status} href={v.link ?? v.arquivoUrl} miniaturaUrl={v.miniaturaUrl} />
            ))}
          </div>
        ) : <Vazio titulo="Nenhum vídeo ainda" />
      ) : aba === 'briefing' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Cartao titulo="Briefing"><p className="whitespace-pre-line text-sm">{k.briefing || '—'}</p></Cartao>
          <Cartao titulo="Produtos, benefícios e tags">
            <div className="space-y-3 text-sm">
              <p>{d.produtos.join(', ')}</p>
              <div className="flex flex-wrap gap-2">{d.beneficios.map((b) => <Etiqueta key={b.id} tom="destaque">{b.nome}</Etiqueta>)}</div>
              <div className="flex flex-wrap gap-2">{k.tags.map((t) => <Etiqueta key={t}>#{t}</Etiqueta>)}</div>
              {k.metaIndividualCentavos && <p className="text-suave">Meta individual: {formatarReais(k.metaIndividualCentavos)} por creator</p>}
            </div>
          </Cartao>
        </div>
      ) : (
        <Tabela colunas={['#', 'Creator', 'Perfil', 'Status', 'Vídeos', 'Vendas', k.metaIndividualCentavos ? 'Meta individual' : '']} alinharDireita={[4, 5]} vazio="Ninguém na campanha ainda.">
          {d.participantes.map((p, n) => (
            <tr key={p.creator.id}>
              <Td>{n + 1}</Td><Td><Pessoa nome={p.creator.nome} /></Td><Td className="text-suave">{p.perfil.perfil}</Td>
              <Td><EtiquetaStatus status={p.participacao.status} /></Td><Td direita>{p.videos}</Td><Td direita>{formatarReais(p.vendas)}</Td>
              <Td className="min-w-32">{k.metaIndividualCentavos ? <BarraProgresso valor={p.vendas} total={k.metaIndividualCentavos} /> : null}</Td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
