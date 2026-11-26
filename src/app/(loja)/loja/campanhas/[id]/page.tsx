// Detalhe da campanha: participantes, ranking, vídeos e briefing. Dono: M5.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil, UserPlus } from 'lucide-react';
import { Abas, Botao, BotaoLink, CabecalhoPagina, CaixaSelecao, Cartao, CartaoIndicador, CartaoVideo, Etiqueta, EtiquetaStatus, Modal, Tabela, Td, Vazio } from '@/componentes';
import { FormSimulado } from '@/componentes/em-breve';
import { BarraProgresso } from '@/componentes/progresso';
import { bpsParaTexto, formatarReais } from '@/dominio/dinheiro';
import { exigirLoja } from '@/lib/acesso';
import { formatarData } from '@/lib/datas';
import { campanhaDaLoja } from '@/modulos/m5-campanhas/dados';

const ENTREGA = { publicar: 'Publicar nas redes', entregar_arquivo: 'Entregar o arquivo', publicar_e_entregar: 'Publicar e entregar o arquivo' };

export default async function DetalheCampanha({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { id } = await params;
  const { aba = 'participantes' } = await searchParams;
  const d = campanhaDaLoja(lojaId, id);
  if (!d) notFound();
  const k = d.campanha;
  return (
    <>
      <CabecalhoPagina titulo={k.nome} voltar={<Link href="/loja/campanhas">← Campanhas</Link>}
        descricao={<>{formatarData(k.inicio)} a {formatarData(k.fim)} · {bpsParaTexto(k.comissaoBps)} de comissão · {ENTREGA[k.entrega]}</>}
        acoes={<>
          <EtiquetaStatus status={k.status} />
          <Modal titulo="Convidar creators aprovados" gatilho={<Botao variante="secundario"><UserPlus size={16} />Convidar</Botao>}>
            <FormSimulado mensagem="Convites enviados (simulação)." className="space-y-3">
              {d.convidaveis.length ? d.convidaveis.map((c) => <CaixaSelecao key={c.id} name="creatorIds" value={c.id} rotulo={c.nome} className="flex" />)
                : <p className="text-sm text-suave">Todos os creators aprovados já estão na campanha.</p>}
              <div className="flex justify-end"><Botao type="submit" disabled={!d.convidaveis.length}>Enviar convites</Botao></div>
            </FormSimulado>
          </Modal>
          <BotaoLink href={`/loja/campanhas/${k.id}/editar`}><Pencil size={16} />Editar</BotaoLink>
        </>} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-borda bg-superficie p-4 sm:col-span-2">
          <p className="text-xs text-suave">Meta geral</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatarReais(d.realizado)}</p>
          <BarraProgresso className="mt-2" valor={d.realizado} total={k.metaCentavos} legenda={`de ${formatarReais(k.metaCentavos)}`} />
        </div>
        <CartaoIndicador rotulo="Participando" valor={d.participantes.filter((p) => p.participacao.status === 'aceito').length} detalhe={`${d.convidados} convite(s) pendente(s)`} />
        <CartaoIndicador rotulo="Pedidos" valor={d.pedidos} detalhe={`${d.videos.length} vídeos`} />
      </div>

      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'participantes', rotulo: 'Participantes e ranking', href: `?aba=participantes` },
        { chave: 'videos', rotulo: `Vídeos (${d.videos.length})`, href: `?aba=videos` },
        { chave: 'briefing', rotulo: 'Briefing e produtos', href: `?aba=briefing` },
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
          <Cartao titulo="Briefing"><p className="whitespace-pre-line text-sm">{k.briefing}</p></Cartao>
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
              <Td>{n + 1}</Td><Td className="font-medium">{p.creator.nome}</Td><Td className="text-suave">{p.perfil.perfil}</Td>
              <Td><EtiquetaStatus status={p.participacao.status} /></Td><Td direita>{p.videos}</Td><Td direita>{formatarReais(p.vendas)}</Td>
              <Td className="min-w-32">{k.metaIndividualCentavos ? <BarraProgresso valor={p.vendas} total={k.metaIndividualCentavos} /> : null}</Td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
